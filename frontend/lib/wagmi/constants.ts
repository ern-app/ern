import mainnet from "./1";
import anvil from "./31337";
import ethuiStack from "./15628905";
import type { ContractsT, Currency } from "./types";

export const Addresses: Record<number, ContractsT> = {
  31337: anvil,
  15628905: ethuiStack,
  1: mainnet,
} as const;

export const CURRENCY_DECIMALS: Record<Currency, number> = {
  USDC: 6,
  USDT: 6,
  wBTC: 8,
  ETH: 18,
  USD: 2,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USDC: "USDC",
  USDT: "USDT",
  USD: "$",
  wBTC: "wBTC",
  ETH: "ETH",
};
