/**
 * Constants used throughout the bot application
 */

// Lock Management
export const LOCK_MAX_RETRIES = 5;
export const LOCK_RETRY_DELAY_MS_DEV = 2000;
export const LOCK_RETRY_DELAY_MS_PROD = 20000;

// Shutdown Management
export const SHUTDOWN_MAX_WAIT_SECONDS = 30;
export const SHUTDOWN_POLL_INTERVAL_MS = 1000;

// Slippage Calculation
export const SLIPPAGE_BASIS_POINTS = 10000; // 100% = 10000 basis points

// Mock Prices (Development)
export const MOCK_REWARD_TOKEN_PRICE_USD = 120000; // WBTC mock price
export const MOCK_STABLECOIN_PRICE_USD = 1; // USDC/USDT mock price

// Logging
export const LOG_FILE_MAX_SIZE = 5242880; // 5MB
export const LOG_FILE_MAX_FILES = 5;

// Default Configuration Values
export const DEFAULT_MIN_PROFIT_THRESHOLD_USD = 50;
export const DEFAULT_HARVEST_INTERVAL_SECS_DEV = 60; // 1 minute
export const DEFAULT_HARVEST_INTERVAL_SECS_PROD = 3600; // 1 hours
export const DEFAULT_SLIPPAGE_TOLERANCE_BPS = 100; // 1%
export const DEFAULT_HARVEST_GAS_LIMIT = 500000; // Gas limit for harvest transactions

// API Configuration
export const ALCHEMY_PRICE_API_BASE_URL = "https://api.g.alchemy.com/prices/v1";
export const ALCHEMY_RPC_BASE_URL = "https://eth-mainnet.g.alchemy.com/v2";
export const ANVIL_RPC_URL = "http://localhost:8545";
export const ETHUI_STACKS_RPC_URL = "https://bityield.stacks.ethui.dev";

// Network Names
export const NETWORK_ANVIL = "anvil" as const;
export const NETWORK_MAINNET = "mainnet" as const;
export const NETWORK_ETHUI_STACKS = "ethuiStacks" as const;

// Validation
export const PRIVATE_KEY_REGEX = /^0x[a-fA-F0-9]{64}$/;
export const MAX_SLIPPAGE_TOLERANCE_BPS = 1000; // 10%
export const MIN_SLIPPAGE_TOLERANCE_BPS = 1; // 0.01%
