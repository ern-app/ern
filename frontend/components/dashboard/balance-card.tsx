"use client";

import { useAccount } from "wagmi";
import { formatCurrency } from "@/helpers/format-currency";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import {
  useReadErnBalanceOf,
  useReadErnClaimableYield,
} from "@/lib/wagmi/wagmi.generated";

export default function BalanceCard() {
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

  // Get available yield
  const { data: yieldUSDC } = useReadErnClaimableYield({
    address: contracts.ernUSDC,
    args: address ? [address] : undefined,
  });

  const { data: yieldUSDT } = useReadErnClaimableYield({
    address: contracts.ernUSDT,
    args: address ? [address] : undefined,
  });

  const totalYield = (yieldUSDC || 0n) + (yieldUSDT || 0n);

  // Get USD value for available yield
  const { data: yieldInUSD } = useUSDPrice({
    amount: totalYield,
    currency: "wBTC",
    oracle: contracts.oracleWBTC,
  });

  // Get USD value for USDC deposits
  const { data: usdcInUSD } = useUSDPrice({
    amount: sharesUSDC || 0n,
    currency: "USDC",
    oracle: contracts.oracleUSDC,
  });

  // Get USD value for USDT deposits
  const { data: usdtInUSD } = useUSDPrice({
    amount: sharesUSDT || 0n,
    currency: "USDT",
    oracle: contracts.oracleUSDT,
  });

  const totalBalanceUSD =
    (usdcInUSD || 0n) + (usdtInUSD || 0n) + (yieldInUSD || 0n);

  return (
    <div className="rounded-[12px] bg-white pt-3 pb-4 md:px-[14px]">
      <div className="mb-2 flex flex-col items-start font-inter">
        <h3 className="font-medium text-black/60 text-sm md:text-base lg:text-lg">
          Balance
        </h3>
        <span className="text-[9px] text-black/30 sm:text-[10px]">
          * Deposits & Current Earnings
        </span>
      </div>

      <p className="font-medium text-lg sm:text-[20px] md:text-[24px]">
        {formatCurrency(totalBalanceUSD, "USD")}
      </p>
    </div>
  );
}
