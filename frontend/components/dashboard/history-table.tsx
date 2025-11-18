"use client";

import { ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatCurrency } from "@/helpers/format-currency";
import { getTokenIcon } from "@/helpers/get-token-icon";
import { useExplorerUrl } from "@/hooks/use-explorer-url";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/wagmi/types";
import ReceiptIcon from "@/public/icons/receipt";
import Button from "../shared/button";
import CustomConnectButton from "../shared/custom-connect-button";

export default function HistoryTable() {
  const { isConnected } = useAccount();
  const { transactions, isLoading, error, refetch } = useTransactionHistory();
  const explorerUrl = useExplorerUrl();

  const renderContent = () => {
    // Show loading state
    if (isLoading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <h3 className="mb-2 font-semibold text-[16px] text-black">
            Loading transaction history...
          </h3>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ReceiptIcon className="mb-2" />
          <h3 className="mb-2 font-semibold text-[16px] text-black">
            Error loading history
          </h3>
          <p className="mb-4 max-w-[230px] text-[12px] text-black/50">
            {error}
          </p>
          <Button
            onClick={() => refetch()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ReceiptIcon className="mb-2" />
          <h3 className="mb-2 font-semibold text-[16px] text-black">
            Connect your wallet
          </h3>
          <CustomConnectButton />
        </div>
      );
    }

    // Show empty state when no transactions
    if (transactions.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ReceiptIcon className="mb-2" />
          <h3 className="mb-2 font-semibold text-[16px] text-black">
            No transactions yet
          </h3>
        </div>
      );
    }

    // Show transaction table
    return (
      <>
        <div className="mb-3 flex items-center justify-end">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-x-2 text-[12px] text-black/50 transition-colors hover:text-black disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="aspect-auto w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="aspect-auto w-3.5" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        <div className="w-[calc(100vw-30px)] max-w-screen overflow-x-auto md:w-full">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full min-w-[500px] border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="border-[#00000061]/30 border-t border-b bg-white px-4 py-2 text-left font-medium text-[14px] text-black/30">
                    Asset
                  </th>
                  <th className="border-[#00000061]/30 border-t border-b bg-white px-4 py-2 text-left font-medium text-[14px] text-black/30">
                    Value
                  </th>
                  <th className="border-[#00000061]/30 border-t border-b bg-white px-4 py-2 text-left font-medium text-[14px] text-black/30">
                    Date
                  </th>
                  <th className="border-[#00000061]/30 border-t border-b bg-white px-4 py-2 text-right font-medium text-[14px] text-black/30">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td
                      className={cn("rounded-l-[6px] p-4", {
                        "bg-[#F7F6F2]": index % 2 === 1,
                      })}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Image
                          src={getTokenIcon(transaction.asset as Currency)}
                          alt={transaction.asset}
                          width={24}
                          height={24}
                          className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                        />
                        <span className="font-medium text-[14px] text-black/70 sm:text-[16px]">
                          {transaction.asset}
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "p-4 font-medium text-[14px] text-black/70 sm:text-[16px]",
                        {
                          "bg-[#F7F6F2]": index % 2 === 1,
                        },
                      )}
                    >
                      {formatCurrency(
                        BigInt(transaction.value),
                        transaction.asset as Currency,
                      )}
                    </td>
                    <td
                      className={cn(
                        "p-4 font-medium text-[14px] text-black/70",
                        {
                          "bg-[#F7F6F2]": index % 2 === 1,
                        },
                      )}
                    >
                      <div>
                        <div>
                          {transaction.date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </div>
                        <div className="text-[12px] text-black/50">
                          {transaction.date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </div>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "flex items-center justify-end gap-2 rounded-r-[6px] p-4 text-right",
                        {
                          "bg-[#F7F6F2]": index % 2 === 1,
                        },
                      )}
                    >
                      <div
                        className={cn(
                          "inline-block rounded-full px-3 py-1.5 font-medium text-xs",
                          {
                            "border border-[#FF5D5D4D] bg-[#FF5D5D4D] text-[#FF5D5D]":
                              transaction.action === "withdraw",
                            "border border-[#5A95844D] bg-[#5A95844D] text-[#5A9584]":
                              transaction.action === "deposit",
                            "border border-[#F7AD1A33] bg-[#F7AD1A33] text-[#F7AD1A]":
                              transaction.action === "earnings",
                            "border border-[#4A90E24D] bg-[#4A90E24D] text-[#4A90E2]":
                              transaction.action === "approval",
                          },
                        )}
                      >
                        {transaction.action.charAt(0).toUpperCase() +
                          transaction.action.slice(1)}
                      </div>

                      <Link
                        href={`${explorerUrl}/tx/${transaction.hash}`}
                        className="text-black transition-opacity hover:text-black/80"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="aspect-auto w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length > 0 && (
            <div className="my-5 text-center text-black/40 text-xs">
              Found {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} in the last 60 days
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="font-inter">
      <h2 className="mb-3 font-medium text-[16px] text-black/50">History</h2>
      {renderContent()}
    </div>
  );
}
