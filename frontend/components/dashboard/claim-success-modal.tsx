import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NoiseBackground from "@/components/shared/noise-background";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatCurrency } from "@/helpers/format-currency";
import { useExplorerUrl } from "@/hooks/use-explorer-url";
import ChevronRight from "@/public/icons/chevron-right";
import ExternalLink from "@/public/icons/external-link";
import Button from "../shared/button";

type ClaimSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimedAmount: bigint;
  lastClaimedUSDC: bigint;
  lastClaimedUSDT: bigint;
  transactionHash?: string;
};

export default function ClaimSuccessModal({
  open,
  onOpenChange,
  claimedAmount,
  lastClaimedUSDC,
  lastClaimedUSDT,
  transactionHash,
}: ClaimSuccessModalProps) {
  const explorerUrl = useExplorerUrl();

  const earnings = [
    {
      symbol: "USDC",
      amount: formatCurrency(lastClaimedUSDC, "wBTC"),
    },
    {
      symbol: "USDT",
      amount: formatCurrency(lastClaimedUSDT, "wBTC"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] cursor-auto overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] font-inter shadow-2xl sm:w-[520px]">
        <NoiseBackground
          className="absolute inset-0 rounded-3xl"
          opacity={0.3}
          intensity="medium"
        />

        {/* Header */}
        <div className="relative z-10 overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6">
          <Button
            className="absolute top-4 right-4 z-20 cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-[16px] w-[16px] text-white" />
          </Button>
          <h2 className="relative z-10 text-center font-semibold text-[24px] text-white sm:text-[36px]">
            Claim Successful
          </h2>

          {/* Checkmark Image */}
          <div className="pointer-events-none flex w-full justify-center p-5 sm:p-10">
            <Image
              className="aspect-auto w-[180px] sm:w-[220px] lg:w-[260px]"
              src="/images/checkmark-white.png"
              width={220}
              height={220}
              alt="checkmark"
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6">
          {/* Claimed Amount */}
          <div className="mb-6 rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">CLAIMED:</span>
              <div className="flex items-center gap-2">
                <Image
                  className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                  src="/images/coins/btc.png"
                  width={24}
                  height={24}
                  alt="wBTC"
                />
                <span className="text-lg text-white">
                  {formatCurrency(claimedAmount, "wBTC")}
                </span>
              </div>
            </div>
          </div>

          {/* Your Earnings */}
          <div className="mb-6 rounded-xl border border-white/20 bg-white/10 py-2 backdrop-blur-sm">
            <h3 className="mb-3 px-3 font-semibold text-sm text-white">
              YOUR EARNINGS
            </h3>

            <div>
              {earnings.map((earning, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: previous team
                <div key={index}>
                  {<div className="my-3 border-white/20 border-t" />}
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <Image
                        className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                        src={`/images/coins/${earning.symbol.toLowerCase()}.png`}
                        width={24}
                        height={24}
                        alt={earning.symbol}
                      />
                      <span className="text-sm text-white/70">
                        {earning.symbol} DEPOSIT
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">
                        {earning.amount}
                      </span>
                      <Image
                        className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                        src="/images/coins/btc.png"
                        width={24}
                        height={24}
                        alt="wBTC"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View on Explorer */}
          {transactionHash && explorerUrl && (
            <Link
              href={`${explorerUrl}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center justify-center gap-2 font-medium text-white hover:underline"
            >
              <span>View on Explorer</span>
              <ExternalLink className="brightness-0 invert" />
            </Link>
          )}

          {/* Close Button */}
          <Button
            className="flex w-full items-center justify-center gap-x-3 rounded-xl bg-white py-4 font-inter font-semibold text-base text-gray-900 transition-colors hover:bg-white/90"
            onClick={() => onOpenChange(false)}
          >
            <span>Close</span>
            <ChevronRight className="h-3 w-[7px] text-gray-900/60" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
