"use client";

import { formatUnits, parseUnits } from "viem";
import { formatCurrency } from "@/helpers/format-currency";
import { formatWithCommas } from "@/helpers/format-with-commas";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import { CURRENCY_DECIMALS } from "@/lib/wagmi/constants";
import type { Underlying } from "@/lib/wagmi/types";
import Button from "../shared/button";

type BalanceDisplayProps = {
  amount: string;
  balance: bigint | undefined;
  underlyingToken: Underlying;
  isLoading: boolean;
  onAmountChange: (amount: string) => void;
};

export function BalanceDisplay({
  amount,
  balance,
  underlyingToken,
  isLoading,
  onAmountChange,
}: BalanceDisplayProps) {
  const contracts = useContracts();
  const decimals =
    CURRENCY_DECIMALS[underlyingToken as keyof typeof CURRENCY_DECIMALS];

  // Get USD price for current token
  const { data: usdPrice } = useUSDPrice({
    amount: amount ? parseUnits(amount, decimals) : 0n,
    currency: underlyingToken,
    oracle: contracts[`oracle${underlyingToken}` as keyof typeof contracts],
  });

  const formatBalance = (balance: bigint | undefined, token: Underlying) => {
    if (!balance) return "0.00";
    return formatCurrency(balance, token);
  };

  const getUsdDisplay = () => {
    if (!usdPrice) return "$0.00";
    return `$${formatWithCommas((Number(usdPrice) / 100).toFixed(2))}`;
  };

  const handleMaxClick = () => {
    if (balance) {
      const maxValue = formatUnits(balance, decimals);
      onAmountChange(maxValue);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (balance) {
      const maxValue = formatUnits(balance, decimals);
      const percentageValue = (
        (parseFloat(maxValue) * percentage) /
        100
      ).toString();
      onAmountChange(percentageValue);
    }
  };

  return (
    <div className="mb-[40px] font-inter md:mb-[74px]">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[12px] md:text-base">
          {getUsdDisplay()}
        </span>
        <div className="flex items-center gap-[8px] md:gap-[12px]">
          <Button
            onClick={() => handlePercentageClick(50)}
            className="p-[4px] font-medium text-[12px] text-black/50 transition-colors hover:text-black md:p-[6px] md:text-[14px]"
            disabled={isLoading}
          >
            50%
          </Button>
          <Button
            onClick={handleMaxClick}
            className="p-[4px] font-medium text-[12px] text-black/50 transition-colors hover:text-black md:p-[6px] md:text-[14px]"
            disabled={isLoading}
          >
            Max
          </Button>
          <div className="flex items-center gap-[6px] p-[4px] font-medium text-[12px] text-black/50 md:gap-[8px] md:p-[6px] md:text-[14px]">
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: previous team */}
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>{formatBalance(balance, underlyingToken)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
