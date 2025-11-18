import { ethuiStackFoundry, foundryExtended } from "@ern/wagmi/chains";
import { getContractAddress } from "@ern/wagmi/contracts";
import { ernAbi } from "@ern/wagmi/wagmi.generated";
import dotenv from "dotenv";
import {
  createPublicClient,
  createWalletClient,
  type GetContractReturnType,
  getContract,
  type Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { z } from "zod";
import {
  ALCHEMY_RPC_BASE_URL,
  ANVIL_RPC_URL,
  DEFAULT_HARVEST_GAS_LIMIT,
  DEFAULT_HARVEST_INTERVAL_SECS_DEV,
  DEFAULT_HARVEST_INTERVAL_SECS_PROD,
  DEFAULT_MIN_PROFIT_THRESHOLD_USD,
  DEFAULT_SLIPPAGE_TOLERANCE_BPS,
  ETHUI_STACKS_RPC_URL,
  LOCK_RETRY_DELAY_MS_DEV,
  LOCK_RETRY_DELAY_MS_PROD,
  MAX_SLIPPAGE_TOLERANCE_BPS,
  MIN_SLIPPAGE_TOLERANCE_BPS,
  NETWORK_ANVIL,
  NETWORK_ETHUI_STACKS,
  NETWORK_MAINNET,
  PRIVATE_KEY_REGEX,
} from "./constants";

dotenv.config();

export type Vault = GetContractReturnType<typeof ernAbi, Config["clients"]>;

const CHAIN_CONFIGS = {
  [NETWORK_ANVIL]: {
    chain: foundryExtended,
    rpcUrl: process.env.RPC_URL || ANVIL_RPC_URL,
  },
  [NETWORK_ETHUI_STACKS]: {
    chain: ethuiStackFoundry,
    rpcUrl: process.env.RPC_URL || ETHUI_STACKS_RPC_URL,
  },
  [NETWORK_MAINNET]: {
    chain: mainnet,
    rpcUrl: process.env.RPC_URL || ALCHEMY_RPC_BASE_URL,
  },
} as const;

// Telegram schema - mandatory in production, optional in dev
const telegramSchema =
  process.env.NODE_ENV === "production"
    ? z.object({
        TELEGRAM_BOT_TOKEN: z.string().min(1),
        TELEGRAM_CHAT_ID: z.string().min(1),
      })
    : z.object({
        TELEGRAM_BOT_TOKEN: z.string().optional(),
        TELEGRAM_CHAT_ID: z.string().optional(),
      });

// Zod schema for environment validation
const envSchema = z
  .object({
    // Network Configuration
    CHAIN_NAME: z
      .enum([NETWORK_ANVIL, NETWORK_MAINNET, NETWORK_ETHUI_STACKS])
      .default(
        process.env.NODE_ENV === "production" ? NETWORK_MAINNET : NETWORK_ANVIL,
      ),
    PRIVATE_KEY: z
      .string()
      .regex(PRIVATE_KEY_REGEX, "PRIVATE_KEY must be a valid hex private key"),
    RPC_URL: z.string().url().optional(),

    // API Configuration
    ALCHEMY_API_KEY: z.string().min(1, "ALCHEMY_API_KEY is required"),

    // Bot Parameters
    MIN_PROFIT_THRESHOLD_USD: z
      .string()
      .default(DEFAULT_MIN_PROFIT_THRESHOLD_USD.toString())
      .transform(Number)
      .pipe(z.number().min(0)),

    HARVEST_INTERVAL_SECS: z
      .string()
      .default(
        process.env.NODE_ENV === "production"
          ? DEFAULT_HARVEST_INTERVAL_SECS_PROD.toString()
          : DEFAULT_HARVEST_INTERVAL_SECS_DEV.toString(),
      )
      .transform(Number)
      .pipe(z.number()),

    SLIPPAGE_TOLERANCE_BPS: z
      .string()
      .default(DEFAULT_SLIPPAGE_TOLERANCE_BPS.toString())
      .transform(Number)
      .pipe(
        z
          .number()
          .min(MIN_SLIPPAGE_TOLERANCE_BPS)
          .max(MAX_SLIPPAGE_TOLERANCE_BPS),
      ),

    HARVEST_GAS_LIMIT: z
      .string()
      .default(DEFAULT_HARVEST_GAS_LIMIT.toString())
      .transform(Number)
      .pipe(z.number().min(100000)),
  })
  .merge(telegramSchema);

export function loadConfig() {
  try {
    // Parse base environment variables
    const env = envSchema.parse(process.env);

    const selectedChain = env.CHAIN_NAME;
    const chainConfig = CHAIN_CONFIGS[selectedChain];

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${selectedChain}`);
    }

    const rpcUrl =
      selectedChain === NETWORK_MAINNET
        ? env.RPC_URL || `${ALCHEMY_RPC_BASE_URL}/${env.ALCHEMY_API_KEY}`
        : chainConfig.rpcUrl;

    const chain = {
      ...chainConfig.chain,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    };

    const dev = ([NETWORK_ANVIL, NETWORK_ETHUI_STACKS] as string[]).includes(
      selectedChain,
    );

    const clients = {
      public: createPublicClient({
        chain,
        transport: http(rpcUrl),
      }),
      wallet: createWalletClient({
        account: privateKeyToAccount(env.PRIVATE_KEY as Hex),
        chain,
        transport: http(rpcUrl),
      }),
    };

    const vaults = {
      USDC: getContract({
        address: getContractAddress(chain.id, "ernUSDC"),
        abi: ernAbi,
        client: clients,
      }),
      USDT: getContract({
        address: getContractAddress(chain.id, "ernUSDT"),
        abi: ernAbi,
        client: clients,
      }),
    };

    return {
      dev,
      mockPrices: dev,
      network: {
        rpcUrl,
        privateKey: env.PRIVATE_KEY as Hex,
        chainId: chain.id,
        chainName: selectedChain,
        explorerUrl: chain.blockExplorers?.default?.url,
      },
      alchemy: { apiKey: env.ALCHEMY_API_KEY },

      params: {
        minProfitThresholdUsd: env.MIN_PROFIT_THRESHOLD_USD,
        harvestIntervalSecs: env.HARVEST_INTERVAL_SECS,
        slippageToleranceBps: env.SLIPPAGE_TOLERANCE_BPS,
        harvestGasLimit: BigInt(env.HARVEST_GAS_LIMIT),
        harvestRetryDelayMs: dev
          ? LOCK_RETRY_DELAY_MS_DEV
          : LOCK_RETRY_DELAY_MS_PROD,
      },

      telegram:
        env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID
          ? {
              botToken: env.TELEGRAM_BOT_TOKEN,
              chatId: env.TELEGRAM_CHAT_ID,
            }
          : null,

      clients,
      vaults,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export type Config = ReturnType<typeof loadConfig>;
