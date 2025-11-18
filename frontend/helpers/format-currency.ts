import { formatUnits } from "viem";
import { CURRENCY_DECIMALS, CURRENCY_SYMBOLS } from "@/lib/wagmi/constants";
import type { Currency } from "@/lib/wagmi/types";

export function formatCurrency(
  value: bigint | string | number,
  currency: Currency,
  options: {
    showSymbol?: boolean;
    decimals?: number;
    hideDecimals?: boolean;
  } = {},
): string {
  const { showSymbol = true, decimals, hideDecimals = false } = options;

  const currencyDecimals = CURRENCY_DECIMALS[currency];
  const symbol = CURRENCY_SYMBOLS[currency];

  let formattedValue: string;

  if (typeof value === "bigint") {
    formattedValue = formatUnits(value, currencyDecimals);
  } else {
    // Convert number/string to bigint and then format as subunits
    const bigintValue = BigInt(Math.floor(Number(value)));
    formattedValue = formatUnits(bigintValue, currencyDecimals);
  }

  const numericValue = Number(formattedValue);
  const displayDecimals = hideDecimals
    ? 0
    : decimals !== undefined
      ? decimals
      : currency === "wBTC"
        ? 6
        : 2;

  const formatted = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });

  if (showSymbol) {
    if (currency === "USD") {
      return `${symbol}${formatted}`;
    } else {
      return `${formatted} ${symbol}`;
    }
  }

  return formatted;
}
