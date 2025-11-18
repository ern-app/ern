"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatCurrency } from "@/helpers/format-currency";
import { getTokenIcon } from "@/helpers/get-token-icon";
import { useExplorerUrl } from "@/hooks/use-explorer-url";
import type { Underlying } from "@/lib/wagmi/types";
import ChevronRight from "@/public/icons/chevron-right";
import ExternalLink from "@/public/icons/external-link";
import Button from "../shared/button";

type WithdrawSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawnAmount: bigint;
  currency: Underlying;
  transactionHash?: string;
  claimedYield?: bigint;
};

export default function WithdrawSuccessModal({
  open,
  onOpenChange,
  withdrawnAmount,
  currency,
  transactionHash,
  claimedYield,
}: WithdrawSuccessModalProps) {
  const explorerUrl = useExplorerUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] cursor-auto overflow-hidden rounded-3xl bg-white font-inter shadow-2xl sm:w-[520px]">
        {/* Header */}
        <div className="relative overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="group absolute top-3 right-3 z-20 cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100 sm:top-4 sm:right-4"
          >
            <X className="h-[16px] w-[16px] text-black transition-colors group-hover:text-red-500" />
          </Button>

          <h2 className="relative z-10 text-center font-semibold text-[22px] sm:text-[36px]">
            Withdrawal Successful
          </h2>

          {/* Checkmark Image */}
          <div className="pointer-events-none flex w-full justify-center p-5 sm:p-10">
            <Image
              src="/images/checkmark-black.png"
              className="aspect-auto w-[180px] sm:w-[220px] lg:w-[260px]"
              width={220}
              height={220}
              alt="checkmark"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Withdrawn Amount */}
          <div className="mb-6 rounded-xl border border-[#0000000D] bg-[#B8B8B80D] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black text-sm">
                WITHDRAWN:
              </span>
              <div className="flex items-center gap-2">
                <Image
                  src={getTokenIcon(currency)}
                  alt={currency}
                  width={24}
                  height={24}
                  className="h-5 w-5 md:h-6 md:w-6"
                />
                <span className="text-lg">
                  {formatCurrency(withdrawnAmount, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Your Earnings */}
          {claimedYield && claimedYield > 0n ? (
            <div className="mb-6 rounded-xl border border-[#0000000D] bg-[#B8B8B80D] py-2">
              <h3 className="mb-3 px-3 font-semibold text-sm">YOUR EARNINGS</h3>
              <div>
                <div className="my-3 border-[#0000000D] border-t px-3" />
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src={getTokenIcon(currency)}
                      alt={currency}
                      width={24}
                      height={24}
                      className="h-5 w-5 md:h-6 md:w-6"
                    />
                    <span className="text-gray-400 text-sm">
                      {currency} WITHDRAWAL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {formatCurrency(claimedYield || 0n, "wBTC")}
                    </span>
                    <Image
                      src="/images/coins/btc.png"
                      alt="wBTC"
                      width={24}
                      height={24}
                      className="h-5 w-5 md:h-6 md:w-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* View on Explorer */}
          {transactionHash && (
            <div className="mt-8 flex justify-center">
              {explorerUrl ? (
                <Link
                  href={`${explorerUrl}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center justify-center gap-2 font-medium text-[#6562FD] underline-offset-4 hover:underline"
                >
                  <span>View on Explorer</span>
                  <ExternalLink />
                </Link>
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  Transaction: {transactionHash.slice(0, 10)}...
                  {transactionHash.slice(-8)}
                </div>
              )}
            </div>
          )}

          {/* Done Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center justify-center gap-x-3 rounded-xl bg-[#2C2C24] py-4 font-inter font-semibold text-base text-white transition-opacity hover:opacity-90"
          >
            <span>Done</span>
            <ChevronRight className="h-3 w-[7px] text-white/60" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
