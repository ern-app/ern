"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import { formatCurrency } from "@/helpers/format-currency";
import { useAaveAPYData } from "@/hooks/use-aave-apy";
import { useContracts } from "@/lib/wagmi";
import { useReadErnBalanceOf } from "@/lib/wagmi/wagmi.generated";

export default function DepositsCard() {
  const { address } = useAccount();
  const contracts = useContracts();

  const { data: sharesUSDC } = useReadErnBalanceOf({
    address: contracts.ernUSDC,
    args: address && [address],
  });

  const { data: sharesUSDT } = useReadErnBalanceOf({
    address: contracts.ernUSDT,
    args: address && [address],
  });

  const { data: apyData, isLoading } = useAaveAPYData();

  const formatAPY = (apy: number | undefined, isLoading: boolean) => {
    if (isLoading) return "Loading...";
    if (!apy) return "N/A";

    const deductedAPY = apy * 0.9; // Apply 10% platform fee
    return `${deductedAPY.toFixed(2)}% APY`;
  };

  return (
    <div className="rounded-[12px] bg-white pt-3 pb-4 md:px-[14px]">
      <h3 className="mb-5 font-inter font-medium text-black/60 text-sm md:text-base lg:text-lg">
        Deposits
      </h3>

      <div className="space-y-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Image
              src="/images/coins/usdc.png"
              width={24}
              height={24}
              className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6"
              alt="USDC"
            />
            <p className="font-medium text-lg sm:text-[20px] md:text-[24px]">
              {formatCurrency(sharesUSDC || 0, "USDC")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6" />
            <div className="flex flex-col items-start">
              <span className="font-inter font-medium text-[#50AF95] text-xs">
                {formatAPY(apyData?.latest?.usdc?.apy, isLoading)}{" "}
              </span>
              <span className="text-[9px] text-black/30 sm:text-[10px]">
                * Updated hourly
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Image
              src="/images/coins/usdt.png"
              width={24}
              height={24}
              className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6"
              alt="USDT"
            />
            <p className="font-medium text-lg sm:text-[20px] md:text-[24px]">
              {formatCurrency(sharesUSDT || 0, "USDT")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6" />
            <div className="flex flex-col items-start">
              <span className="font-inter font-medium text-[#50AF95] text-xs">
                {formatAPY(apyData?.latest?.usdt?.apy, isLoading)}{" "}
              </span>
              <span className="text-[9px] text-black/30 sm:text-[10px]">
                * Updated hourly
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
