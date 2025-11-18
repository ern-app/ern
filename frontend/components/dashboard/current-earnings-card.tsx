"use client";

import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import NoiseBackground from "@/components/shared/noise-background";
import { formatCurrency } from "@/helpers/format-currency";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import { useReadErnClaimableYield } from "@/lib/wagmi/wagmi.generated";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "../shared/button";
import AvailableYieldModal from "./available-yield-modal";

export default function CurrentEarningsCard() {
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [isClaimHovered, setIsClaimHovered] = useState(false);
  const [isClaimPressed, setIsClaimPressed] = useState(false);

  const { address } = useAccount();
  const contracts = useContracts();

  const { data: yieldUSDC } = useReadErnClaimableYield({
    address: contracts.ernUSDC,
    args: address ? [address] : undefined,
  });

  const { data: yieldUSDT } = useReadErnClaimableYield({
    address: contracts.ernUSDT,
    args: address ? [address] : undefined,
  });

  const totalYield = (yieldUSDC || 0n) + (yieldUSDT || 0n);

  const { data: yieldInUSD } = useUSDPrice({
    amount: totalYield,
    currency: "wBTC",
    oracle: contracts.oracleWBTC,
  });

  return (
    <div className="flex flex-col rounded-[12px] bg-white pt-3 pb-4 md:px-[14px]">
      <h3 className="mb-1 font-inter font-medium text-black/60 text-sm md:text-base lg:text-lg">
        Current Earnings
      </h3>
      <span className="mb-5 text-[9px] text-black/30 sm:text-[10px]">
        * Updated daily
      </span>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <Image
            className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6"
            src="/images/coins/btc.png"
            width={24}
            height={24}
            alt="BTC"
          />
          <p className="font-medium text-[20px] md:text-[24px]">
            {formatCurrency(totalYield, "wBTC", {
              showSymbol: false,
            })}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6" />
          <p className="font-inter font-medium text-[11px]">
            {formatCurrency(yieldInUSD || 0, "USD")}
          </p>
        </div>
      </div>

      <Button
        className="relative mt-6 flex cursor-pointer items-center justify-center gap-x-3 overflow-hidden rounded-[8px] bg-[#6E6E60] py-[10px] font-inter text-[12px] text-white hover:bg-[#6E6E60]/80 disabled:cursor-default disabled:bg-[#6E6E60] disabled:opacity-60 md:py-[12px] md:text-[16px] lg:mt-auto"
        onClick={() => setIsYieldModalOpen(true)}
        onMouseEnter={() => setIsClaimHovered(true)}
        onMouseLeave={() => {
          setIsClaimHovered(false);
          setIsClaimPressed(false);
        }}
        onMouseDown={() => setIsClaimPressed(true)}
        onMouseUp={() => setIsClaimPressed(false)}
        disabled={totalYield === 0n}
        style={{
          transform: isClaimPressed
            ? "scale(1)"
            : isClaimHovered
              ? "scale(1.02)"
              : "scale(1)",
          transition: "transform 0.15s ease-out",
        }}
      >
        <NoiseBackground
          className="absolute inset-0"
          opacity={0.3}
          intensity="high"
        />
        <span
          className="relative z-10"
          style={{
            transform: isClaimPressed
              ? "scale(1)"
              : isClaimHovered
                ? "scale(1.04)"
                : "scale(1)",
            transition: "transform 0.15s ease-out",
          }}
        >
          Claim
        </span>
        <ChevronRight
          className="relative z-10 h-3 w-[7px] text-white/60"
          isHovered={isClaimHovered}
        />
      </Button>

      {/* Available Yield Modal */}
      <AvailableYieldModal
        open={isYieldModalOpen}
        onOpenChange={() => setIsYieldModalOpen(false)}
      />
    </div>
  );
}
