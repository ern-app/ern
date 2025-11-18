"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { currencyFormatter, longDecimalsFormatter } from "@/helpers/formatter";
import { useDebounce } from "@/hooks/use-debounce";
import { useYieldData } from "@/hooks/use-yield-data";
import { cn } from "@/lib/utils";
import { useYieldStore } from "@/lib/yield-store";
import Input from "../shared/input";

const MIN_APY = 0.5;
const MAX_APY = 15;
const STEP_APY = 0.05;
const MAX_DEPOSIT = 1000000000; // 1 billion

export default function YieldSimulator() {
  const [depositInput, setDepositInput] = useState<string>("100000");
  const [apyInput, setApyInput] = useState(4.75);

  const debouncedDeposit = useDebounce(depositInput, 200);
  const debouncedApy = useDebounce(apyInput, 200);

  const numDeposit = parseFloat(debouncedDeposit) || 100000;
  const {
    yearlyData,
    totalMarketValue,
    totalErnValue,
    totalBtcEarned,
    advantage,
    performance,
  } = useYieldData(numDeposit, debouncedApy);

  // Compute totals locally for display
  const totals = useMemo(
    () => ({
      totalMarketValue,
      totalErnValue,
      totalBtcEarned,
      advantage,
      performance,
    }),
    [totalMarketValue, totalErnValue, totalBtcEarned, advantage, performance],
  );

  // Sync to store for other components
  useEffect(() => {
    if (yearlyData.length > 0) {
      useYieldStore.setState({
        initialDeposit: numDeposit,
        yearlyData,
        totalMarketValue: totals.totalMarketValue,
        totalErnValue: totals.totalErnValue,
        totalBtcEarned: totals.totalBtcEarned,
        advantage: totals.advantage,
        performance: totals.performance,
      });
    }
  }, [yearlyData, totals, numDeposit]);

  const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (!Number.isNaN(numValue) && numValue > MAX_DEPOSIT) {
      setDepositInput(MAX_DEPOSIT.toString());
    } else {
      setDepositInput(value);
    }
  };

  const handleApyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApyInput(parseFloat(e.target.value));
  };

  const progress = (apyInput - MIN_APY) / (MAX_APY - MIN_APY);
  const hasDepositValue = depositInput.trim().length > 0;

  return (
    <div className="flex h-full w-full flex-col rounded-xl bg-[#F7F6F2] px-4 pt-5 pb-5 lg:rounded-[18px] lg:px-[22px] lg:pt-[42px]">
      <h3 className="font-medium text-2xl lg:text-[30px]">Yield Simulator</h3>

      <div className="space-y-3 py-6">
        <p className="font-inter font-medium text-sm">Initial Deposit</p>
        <div className="relative">
          <span
            className={cn(
              "-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 font-inter font-medium text-base transition-colors lg:text-lg",
              {
                "text-black": hasDepositValue,
                "text-black/40": !hasDepositValue,
              },
            )}
          >
            $
          </span>
          <Input
            type="number"
            value={depositInput}
            onChange={handleDepositChange}
            className="w-full rounded-[10px] bg-[#EBEBEB] px-[30px] py-3 font-inter font-medium text-base text-black placeholder:text-black/40 lg:py-4 lg:text-lg"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 font-inter font-medium text-[10px] lg:text-xs">
        <div className="rounded-full border-2 border-black/10 border-dashed bg-black/[0.03] px-2 py-1.5 lg:px-2.5 lg:py-2">
          Market Average: {currencyFormatter.format(totals.totalMarketValue)}
        </div>

        <div className="flex items-center justify-center rounded-full bg-[var(--color-primary)] px-2 py-1.5 text-white lg:px-2.5 lg:py-2">
          Ern: {currencyFormatter.format(totals.totalErnValue)}
        </div>

        <div className="flex items-center justify-center rounded-full border border-black/10 bg-white px-2 py-1.5 lg:px-2.5 lg:py-2">
          Advantage: +{currencyFormatter.format(totals.advantage)}
        </div>

        <div className="flex items-center justify-center rounded-full border border-black/10 bg-white px-2 py-1.5 lg:px-2.5 lg:py-2">
          Earned Bitcoin: +{longDecimalsFormatter.format(totals.totalBtcEarned)}
        </div>

        <div className="flex items-center justify-center gap-x-1 rounded-full border border-black/10 bg-white px-2 py-1.5 lg:px-2.5 lg:py-2">
          <span>Ern Performance vs Market Average:</span>
          <span className="font-bold">{totals.performance.toFixed(1)}x</span>
        </div>
      </div>

      <div className="mt-[91px] flex flex-1 flex-col justify-end">
        <div className="space-y-3 font-inter">
          <p className="font-semibold text-sm">
            Market Average APY: {apyInput.toFixed(2)}%
          </p>

          <div className="w-full">
            <div className="relative h-[2px] w-full bg-black/20">
              <div
                className="-translate-y-1/2 absolute top-1/2 h-[2px] transform rounded-full bg-black"
                style={{
                  left: 0,
                  width: `calc(${progress * 100}% + 4px)`,
                }}
              />
              <div
                className="-translate-y-1/2 -translate-x-1/2 pointer-events-none absolute top-1/2 mx-1 h-2 w-2 transform cursor-pointer rounded-full bg-black"
                style={{ left: `calc(${progress * 100}% )` }}
              />
              <Input
                type="range"
                min={MIN_APY}
                max={MAX_APY}
                step={STEP_APY}
                value={apyInput}
                onChange={handleApyChange}
                aria-label="APY"
                className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
              />
            </div>

            <div className="mt-1 flex justify-between font-medium text-black/40 text-sm">
              <p>{MIN_APY}%</p>
              <p>{MAX_APY}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
