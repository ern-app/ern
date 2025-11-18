"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import { formatCurrency } from "@/helpers/format-currency";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import {
  useReadErnClaimableYield,
  useReadErnUsers,
} from "@/lib/wagmi/wagmi.generated";

export default function LifetimeEarningsCard() {
  const { address } = useAccount();
  const contracts = useContracts();

  // Get pending yield for USDC
  const { data: yieldUSDC } = useReadErnClaimableYield({
    address: contracts.ernUSDC,
    args: address ? [address] : undefined,
  });

  // Get pending yield for USDT
  const { data: yieldUSDT } = useReadErnClaimableYield({
    address: contracts.ernUSDT,
    args: address ? [address] : undefined,
  });

  // Get claimed rewards for USDC
  const { data: userUSDC } = useReadErnUsers({
    address: contracts.ernUSDC,
    args: address ? [address] : undefined,
  });

  // Get claimed rewards for USDT
  const { data: userUSDT } = useReadErnUsers({
    address: contracts.ernUSDT,
    args: address ? [address] : undefined,
  });

  const pendingYield = (yieldUSDC || 0n) + (yieldUSDT || 0n);
  const claimedRewards = (userUSDC?.[1] || 0n) + (userUSDT?.[1] || 0n);
  const lifetimeEarnings = pendingYield + claimedRewards;

  const { data: earningsInUSD } = useUSDPrice({
    amount: lifetimeEarnings,
    currency: "wBTC",
    oracle: contracts.oracleWBTC,
  });

  return (
    <div className="rounded-xl bg-white pt-3 pb-4 md:px-[14px]">
      <h3 className="mb-6 font-inter font-medium text-black/60 text-sm md:text-base lg:text-lg">
        Lifetime Earnings
      </h3>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <Image
            src="/images/coins/btc.png"
            alt="BTC"
            width={24}
            height={24}
            className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6"
          />

          <p className="font-medium text-lg sm:text-[20px] md:text-[24px]">
            {formatCurrency(lifetimeEarnings, "wBTC", {
              showSymbol: false,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 flex-shrink-0 md:h-6 md:w-6" />
          <p className="font-inter font-medium text-xs">
            {formatCurrency(earningsInUSD || 0, "USD")}
          </p>
        </div>
      </div>
    </div>
  );
}
