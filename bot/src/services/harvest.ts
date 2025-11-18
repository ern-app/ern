import { erc20Abi, getContract, type PublicClient } from "viem";
import type { Config, Vault } from "../config";
import {
  LOCK_MAX_RETRIES,
  SHUTDOWN_MAX_WAIT_SECONDS,
  SHUTDOWN_POLL_INTERVAL_MS,
  SLIPPAGE_BASIS_POINTS,
} from "../constants";
import { createLogger } from "../logger";
import { sleep } from "../utils/sleep";
import type { PricingService } from "./pricing";
import type { TelegramService } from "./telegram";

// Global harvest lock o prevent nonce clashes between multiple bot instances
let globalHarvestLock = false;

export function getGlobalHarvestLockStatus(): boolean {
  return globalHarvestLock;
}

export interface ExecuteHarvestParams {
  minOut: bigint;
  inputValueUsd: number;
}

interface ConstructorParams {
  config: Config;
  vault: Vault;
  id: string;
  telegram: TelegramService;
  pricing: PricingService;
}

export interface HarvestStats {
  successCount: number;
  failureCount: number;
  lastHarvestTime: Date | null;
  lastHarvestSuccess: boolean | null;
  nextHarvestTime: Date | null;
  startTime: Date;
}

export class HarvestService {
  private logger: ReturnType<typeof createLogger>;
  private pricing: PricingService;
  private harvesting = false;
  private isShuttingDown = false;
  private params: Config["params"];
  private publicClient: PublicClient;
  private telegram: TelegramService;
  public id: string;
  private interval: NodeJS.Timeout | undefined;

  private vault: Vault;

  // Statistics tracking
  private stats: HarvestStats = {
    successCount: 0,
    failureCount: 0,
    lastHarvestTime: null,
    lastHarvestSuccess: null,
    nextHarvestTime: null,
    startTime: new Date(),
  };

  // Track if we've sent the "conditions not met" notification
  private conditionsNotMetNotificationSent = false;

  constructor({ config, vault, id, telegram, pricing }: ConstructorParams) {
    this.params = config.params;
    this.publicClient = config.clients.public;
    this.vault = vault;
    this.logger = createLogger(id, "harvest");
    this.telegram = telegram;
    this.id = id;
    this.pricing = pricing;
    this.telegram.registerBot(this);
  }

  async run() {
    if (this.harvesting || this.isShuttingDown) {
      return;
    }

    this.harvesting = true;
    const acquired = await this.acquireGlobalLock();
    if (!acquired) {
      this.logger.debug(`Skip - locked after max attempts`);
      this.harvesting = false;
      return;
    }

    try {
      this.logger.info(`Initiating harvest`);
      const minOut = await this.check();
      if (!minOut) {
        // Check if we should notify about conditions not being met
        await this.checkAndNotifyConditionsNotMet();
        return;
      }

      const hash = await this.vault.write.harvest([minOut], {
        gas: this.params.harvestGasLimit,
      });
      this.logger.info(`Harvest tx submitted`, { hash });

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      // Check if transaction was successful or reverted
      if (receipt.status === "reverted") {
        this.logger.error(`Harvest reverted`, { hash });
        this.stats.failureCount++;
        this.stats.lastHarvestTime = new Date();
        this.stats.lastHarvestSuccess = false;

        const nextHarvestTime = new Date(
          Date.now() + this.params.harvestIntervalSecs * 1000,
        );

        await this.telegram.notifyHarvest(
          this.id,
          {
            success: false,
            error: "Transaction reverted",
          },
          nextHarvestTime,
        );
        return;
      }

      this.logger.info(`Harvest confirmed`, { hash });
      this.stats.successCount++;
      this.stats.lastHarvestTime = new Date();
      this.stats.lastHarvestSuccess = true;

      // Reset the notification flag on successful harvest
      this.conditionsNotMetNotificationSent = false;

      // Calculate next harvest time
      const nextHarvestTime = new Date(
        Date.now() + this.params.harvestIntervalSecs * 1000,
      );

      await this.telegram.notifyHarvest(
        this.id,
        {
          success: true,
          hash,
        },
        nextHarvestTime,
      );
    } catch (error) {
      if (error && typeof error === "object" && "abi" in error) {
        const errorWithAbi = error as { abi?: unknown };
        delete errorWithAbi.abi;
      }
      this.logger.error(`Harvest error:`, error);
      this.stats.failureCount++;
      this.stats.lastHarvestTime = new Date();
      this.stats.lastHarvestSuccess = false;

      // Calculate next harvest time
      const nextHarvestTime = new Date(
        Date.now() + this.params.harvestIntervalSecs * 1000,
      );

      await this.telegram.notifyHarvest(
        this.id,
        {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        nextHarvestTime,
      );
    } finally {
      this.harvesting = false;
      this.releaseGlobalLock();
      // Update next harvest time
      this.stats.nextHarvestTime = new Date(
        Date.now() + this.params.harvestIntervalSecs * 1000,
      );
    }
  }

  private async check() {
    const [canHarvest, yieldAmount] = await this.vault.read.canHarvest();

    if (!canHarvest) {
      this.logger.debug(`harvest skipped`, { canHarvest: false });
      return;
    }

    if (yieldAmount === 0n) {
      this.logger.debug(`harvest skipped`, { yield: 0 });
      return;
    }

    const { minOut, minOutUsd } = await this.calculateMinOut(yieldAmount);
    if (minOut === 0n) {
      this.logger.warn(`harvest skipped`, { minOut: 0 });
      return;
    }

    if (minOutUsd < this.params.minProfitThresholdUsd) {
      this.logger.debug(`harvest skipped`, {
        minOutUsd,
        threshold: this.params.minProfitThresholdUsd,
      });
      return;
    }

    return minOut;
  }

  private async checkAndNotifyConditionsNotMet() {
    // Don't send notification if we've already sent it
    if (this.conditionsNotMetNotificationSent) {
      return;
    }

    const now = new Date();
    const lastHarvestTime = this.stats.lastHarvestTime;

    // Check if it's been more than 24 hours since last harvest (or no harvest at all)
    const hoursElapsed = lastHarvestTime
      ? (now.getTime() - lastHarvestTime.getTime()) / (1000 * 60 * 60)
      : Number.POSITIVE_INFINITY;

    if (hoursElapsed > 24) {
      this.logger.info(`Notifying conditions not met`, {
        lastHarvestTime,
        hoursElapsed: lastHarvestTime ? Math.floor(hoursElapsed) : "N/A",
      });

      await this.telegram.notifyHarvestConditionsNotMet(
        this.id,
        lastHarvestTime,
      );

      // Mark notification as sent
      this.conditionsNotMetNotificationSent = true;
    }
  }

  setShuttingDown(value: boolean): void {
    this.isShuttingDown = value;
  }

  isHarvesting(): boolean {
    return this.harvesting;
  }

  getStats(): HarvestStats {
    return { ...this.stats };
  }

  async start() {
    const logger = createLogger(this.id, "bot");
    logger.info(`[${this.id}] Started`);

    // Set initial next harvest time
    this.stats.nextHarvestTime = new Date(
      Date.now() + this.params.harvestIntervalSecs * 1000,
    );

    // Run immediately
    this.run();

    // Schedule periodic runs
    this.interval = setInterval(
      () => this.run(),
      this.params.harvestIntervalSecs * 1000,
    );
  }

  async stop() {
    const logger = createLogger(this.id, "bot");
    logger.info(`Stopping...`);
    this.setShuttingDown(true);

    // Clear the interval to stop scheduling new harvests
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      logger.info(`[${this.id}] Interval cleared`);
    }

    // Wait for any ongoing harvest to complete
    let waitCount = 0;
    while (this.isHarvesting() && waitCount < SHUTDOWN_MAX_WAIT_SECONDS) {
      logger.debug(
        `[${this.id}] Waiting... (${waitCount + 1}/${SHUTDOWN_MAX_WAIT_SECONDS}s)`,
      );
      await sleep(SHUTDOWN_POLL_INTERVAL_MS);
      waitCount++;
    }

    if (this.isHarvesting()) {
      logger.warn(`Forced stop (timeout)`);
    } else {
      logger.info(`Clean stop`);
    }
  }

  private async acquireGlobalLock(): Promise<boolean> {
    for (let attempt = 1; attempt <= LOCK_MAX_RETRIES; attempt++) {
      if (!globalHarvestLock) {
        globalHarvestLock = true;
        return true;
      }

      if (attempt === LOCK_MAX_RETRIES) return false;
      await sleep(this.params.harvestRetryDelayMs);
    }

    return false;
  }

  private releaseGlobalLock(): void {
    globalHarvestLock = false;
  }

  private async calculateMinOut(swapIn: bigint) {
    const underlying = getContract({
      address: await this.vault.read.UNDERLYING(),
      abi: erc20Abi,
      client: this.publicClient,
    });
    const rewardToken = getContract({
      address: await this.vault.read.REWARD_TOKEN(),
      abi: erc20Abi,
      client: this.publicClient,
    });

    const underlyingDecimals = await underlying.read.decimals();
    const rewardTokenDecimals = await rewardToken.read.decimals();

    const inputPrice = await this.pricing.getUnderlyingPrice(
      underlying.address,
    );
    const outputPrice = await this.pricing.getRewardPrice(rewardToken.address);

    const swapInUsd = (Number(swapIn) / 10 ** underlyingDecimals) * inputPrice;

    const expectedOutAmount = swapInUsd / outputPrice;
    const slippageMultiplier =
      (SLIPPAGE_BASIS_POINTS - this.params.slippageToleranceBps) /
      SLIPPAGE_BASIS_POINTS;
    const minOutAmount = expectedOutAmount * slippageMultiplier;
    const minOut = BigInt(Math.floor(minOutAmount * 10 ** rewardTokenDecimals));
    const minOutUsd = minOutAmount * outputPrice;

    this.logger.debug(`Swap math`, {
      swapIn,
      swapInUsd,
      expectedOutAmount,
      minOut,
      minOutUsd,
    });

    return { minOut, minOutUsd };
  }
}
