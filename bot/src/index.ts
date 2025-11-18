import { loadConfig } from "./config";
import { createLogger } from "./logger";
import { HarvestService } from "./services/harvest";
import { PricingService } from "./services/pricing";
import { TelegramService } from "./services/telegram";

const mainLogger = createLogger("main");

main().catch((error) => {
  mainLogger.error("Fatal:", error);
  process.exit(1);
});

async function main() {
  try {
    const bots: HarvestService[] = [];
    let telegram: TelegramService | null = null;
    let isShuttingDown = false;

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      if (isShuttingDown) {
        mainLogger.debug(`Already shutting down, ignoring ${signal}`);
        return;
      }
      isShuttingDown = true;

      mainLogger.info(`${signal} - stopping bots...`);
      await telegram?.notifyShutdown();
      await Promise.all(bots.map((bot) => bot.stop()));
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Keep the process running
    process.on("uncaughtException", async (error) => {
      if (isShuttingDown) {
        mainLogger.debug("Already shutting down, ignoring uncaught exception");
        return;
      }
      isShuttingDown = true;

      mainLogger.error("Uncaught exception:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      await telegram?.notifyShutdown(`Uncaught exception: ${errorMsg}`);
      await Promise.all(bots.map((bot) => bot.stop()));
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason, _promise) => {
      if (isShuttingDown) {
        mainLogger.debug("Already shutting down, ignoring unhandled rejection");
        return;
      }
      isShuttingDown = true;

      mainLogger.error("Unhandled rejection:", reason);
      const errorMsg =
        reason instanceof Error ? reason.message : String(reason);
      await telegram?.notifyShutdown(`Unhandled rejection: ${errorMsg}`);
      await Promise.all(bots.map((bot) => bot.stop()));
      process.exit(1);
    });

    const config = loadConfig();

    // Initialize Telegram service
    telegram = new TelegramService(config);

    mainLogger.info(`Starting bots for ${config.network.chainName}`, {
      mockPrices: config.mockPrices,
      harvestIntervalSecs: config.params.harvestIntervalSecs,
    });

    Object.entries(config.vaults).forEach(([name, vault]) => {
      const id = `${config.network.chainName}/${name}`;
      const pricing = new PricingService({ config, id });
      const bot = new HarvestService({
        config,
        vault,
        id,
        telegram,
        pricing,
      });
      bot.start();
      return bot;
    });

    mainLogger.info(`Started ${bots.length} bots`);
    await telegram.notifyStartup();
  } catch (error) {
    mainLogger.error("Start failed:", error);
    process.exit(1);
  }
}
