import type { Address } from "viem";
import { CURRENCY_DECIMALS } from "@/lib/wagmi/constants";
import type { Currency } from "@/lib/wagmi/types";
import {
  useReadIAggregatorV3Decimals,
  useReadIAggregatorV3LatestRoundData,
} from "@/lib/wagmi/wagmi.generated";

export function useReadOraclePrice({ oracle }: { oracle: Address }): {
  price: bigint | undefined;
  decimals: number | undefined;
  isLoading: boolean;
} {
  const { data: decimals, isLoading: isLoadingDecimals } =
    useReadIAggregatorV3Decimals({
      address: oracle,
    });
  const { data, isLoading: isLoadingData } =
    useReadIAggregatorV3LatestRoundData({
      address: oracle,
    });

  return {
    price: data?.[1],
    decimals,
    isLoading: isLoadingDecimals || isLoadingData,
  };
}

export function useUSDPrice({
  amount,
  currency,
  oracle,
}: {
  amount?: bigint | string | number;
  currency: Currency;
  oracle: Address;
}): { data?: bigint; isLoading: boolean } {
  // For non-stablecoins (wBTC, ETH), use oracle price
  const { price, decimals: oracleDecimals } = useReadOraclePrice({
    oracle,
  });

  // For stablecoins (USDC/USDT), use 1:1 exchange rate with USD
  if (currency === "USDC" || currency === "USDT") {
    if (!amount) {
      return { data: undefined, isLoading: false };
    }

    const currencyDecimals = CURRENCY_DECIMALS[currency];

    // Convert to cents (USD has 2 decimals)
    // 1 USDC/USDT = 1 USD, so multiply by 100 for cents then divide by currency decimals
    const cents = (BigInt(amount) * 100n) / 10n ** BigInt(currencyDecimals);

    return { data: cents, isLoading: false };
  }

  if (!price || !oracleDecimals || !amount) {
    return { data: undefined, isLoading: true };
  }

  const currencyDecimals = CURRENCY_DECIMALS[currency] || 18;

  const product = BigInt(amount) * price;
  const totalDecimals = BigInt(currencyDecimals) + BigInt(oracleDecimals);

  // keep 2 extra degrees of precision
  const cents = (product * 100n) / 10n ** totalDecimals;

  return { data: cents, isLoading: false };
}
