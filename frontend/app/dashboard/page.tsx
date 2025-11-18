"use client";

import { useState } from "react";
import BalanceCard from "@/components/dashboard/balance-card";
import CurrentEarningsCard from "@/components/dashboard/current-earnings-card";
import DepositTab from "@/components/dashboard/deposit-tab";
import DepositsCard from "@/components/dashboard/deposits-card";
import HistoryTable from "@/components/dashboard/history-table";
import LifetimeEarningsCard from "@/components/dashboard/lifetime-earnings-card";
import PriceChart from "@/components/dashboard/price-chart";
import WithdrawTab from "@/components/dashboard/withdraw-tab";
import Button from "@/components/shared/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  return (
    <div className="mx-auto mt-[85px] max-w-[1520px] px-4 sm:mt-[135px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-8 lg:order-1">
          <PriceChart />
          <HistoryTable />
        </div>

        <div className="order-1 flex w-full flex-shrink-0 flex-col lg:order-2 lg:max-w-[600px]">
          {/* Stats Cards - Below deposit/withdraw flow */}
          <div className="grid grid-cols-2 gap-2 rounded-xl md:gap-3 lg:p-3">
            <BalanceCard />
            <LifetimeEarningsCard />
            <DepositsCard />
            <CurrentEarningsCard />
          </div>

          {/* Tab Buttons */}
          <div className="my-8 flex gap-3 rounded-full bg-[#F7F6F2] p-0.5">
            <Button
              onClick={() => setActiveTab("deposit")}
              className={cn(
                "flex-1 rounded-full py-[10px] font-medium text-[14px] transition-all md:text-[16px]",
                {
                  "bg-[var(--color-primary)] text-white":
                    activeTab === "deposit",
                  "bg-transparent text-black": activeTab !== "deposit",
                },
              )}
            >
              Deposit
            </Button>
            <Button
              onClick={() => setActiveTab("withdraw")}
              className={cn(
                "flex-1 rounded-full py-[10px] font-medium text-[14px] transition-all md:text-[16px]",
                {
                  "bg-[var(--color-primary)] text-white":
                    activeTab === "withdraw",
                  "bg-transparent text-black": activeTab !== "withdraw",
                },
              )}
            >
              Withdraw
            </Button>
          </div>

          {/* Deposit Content */}
          {activeTab === "deposit" && <DepositTab />}

          {/* Withdraw Content */}
          {activeTab === "withdraw" && <WithdrawTab />}
        </div>
      </div>
    </div>
  );
}
