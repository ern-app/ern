import type { Address } from "viem";

export type ContractsT = {
  ernUSDC: Address;
  ernUSDT: Address;
  USDC: Address;
  USDT: Address;
  wBTC: Address;
  oracleUSDC: Address;
  oracleUSDT: Address;
  oracleWBTC: Address;
  multicall: Address;
};

export type Underlying = "USDC" | "USDT";
export type Yield = "wBTC" | "ETH";
export type Currency = Underlying | Yield | "USD";
