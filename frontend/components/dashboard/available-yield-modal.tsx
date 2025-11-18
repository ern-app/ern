"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { type Address, encodeFunctionData } from "viem";
import { useAccount } from "wagmi";
import NoiseBackground from "@/components/shared/noise-background";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getErrorMessage } from "@/helpers/errors";
import { formatCurrency } from "@/helpers/format-currency";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import { publicClient } from "@/lib/wagmi/wagmi";
import {
  ernAbi,
  useReadErnClaimableYield,
  useWriteMulticallAggregate,
} from "@/lib/wagmi/wagmi.generated";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "../shared/button";
import RiveComponent from "../shared/RiveComponent";
import ClaimSuccessModal from "./claim-success-modal";

type AvailableYieldModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AvailableYieldModal({
  open,
  onOpenChange,
}: AvailableYieldModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>();
  const [lastClaimedUSDC, setLastClaimedUSDC] = useState<bigint>();
  const [lastClaimedUSDT, setLastClaimedUSDT] = useState<bigint>();
  const [claimedTotal, setClaimedTotal] = useState<bigint>();

  const { address } = useAccount();
  const contracts = useContracts();

  const { data: yieldUSDC, refetch: refetchUSDC } = useReadErnClaimableYield({
    address: contracts.ernUSDC,
    args: address ? [address] : undefined,
  });

  const { data: yieldUSDT, refetch: refetchUSDT } = useReadErnClaimableYield({
    address: contracts.ernUSDT,
    args: address ? [address] : undefined,
  });

  const totalYield = (yieldUSDC || 0n) + (yieldUSDT || 0n);

  const { data: yieldInUSD } = useUSDPrice({
    amount: claimedTotal ?? totalYield,
    currency: "wBTC",
    oracle: contracts.oracleWBTC,
  });

  const { writeContractAsync: writeContractAsyncMulticall } =
    useWriteMulticallAggregate();

  const handleClaim = async () => {
    if (!address || (!yieldUSDC && !yieldUSDT)) return;

    setIsLoading(true);
    setLastClaimedUSDC(yieldUSDC || 0n);
    setLastClaimedUSDT(yieldUSDT || 0n);
    setClaimedTotal(totalYield);
    const toastId = toast.loading("Claiming yield...");

    const calls: { target: Address; callData: Address }[] = [];

    if (yieldUSDC && yieldUSDC > 0n) {
      calls.push({
        target: contracts.ernUSDC,
        callData: encodeFunctionData({
          abi: ernAbi,
          functionName: "claimYieldOnBehalf",
          args: [address],
        }),
      });
    }

    if (yieldUSDT && yieldUSDT > 0n) {
      calls.push({
        target: contracts.ernUSDT,
        callData: encodeFunctionData({
          abi: ernAbi,
          functionName: "claimYieldOnBehalf",
          args: [address],
        }),
      });
    }

    try {
      if (calls.length > 0) {
        const hash = await writeContractAsyncMulticall({
          address: contracts.multicall,
          args: [calls],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          toast.success("Yield claimed successfully!", {
            id: toastId,
          });
          setTransactionHash(hash);
          await Promise.all([refetchUSDC(), refetchUSDT()]);
        } else {
          toast.error("Yield claim failed!", { id: toastId });
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const clearTransactionData = () => {
    setTransactionHash(undefined);
    setLastClaimedUSDC(undefined);
    setLastClaimedUSDT(undefined);
    setClaimedTotal(undefined);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[90%] cursor-auto overflow-hidden overflow-y-auto rounded-3xl bg-white font-inter shadow-2xl sm:w-[520px]">
          {/* Header */}
          <div className="relative p-4 pb-8 sm:p-6">
            <Button
              onClick={() => onOpenChange(false)}
              className="group absolute top-4 right-4 z-20 cursor-pointer rounded-lg p-2 transition-colors duration-300 hover:bg-gray-100"
            >
              <X className="h-[16px] w-[16px] text-black transition-colors group-hover:text-red-500" />
            </Button>
            <h2 className="relative z-10 mb-8 text-center font-semibold text-[24px] sm:text-[36px]">
              Available Yield
            </h2>

            <div className="-mt-28 mb-6 flex justify-center">
              <div className="h-[400px] w-[400px]">
                <RiveComponent
                  src="/illustrations/step2.riv"
                  className="aspect-square h-full w-full"
                  width={500}
                  height={500}
                  loop={true}
                />
              </div>
            </div>

            {/* Yield Amount */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <Image
                src="/images/coins/btc.png"
                className="mt-1 mb-1.5 h-5 w-5 md:h-7 md:w-7"
                width={24}
                height={24}
                alt="wBTC"
              />
              <span className="font-semibold text-[32px]">
                {formatCurrency(totalYield || 0n, "wBTC")}
              </span>
            </div>
          </div>

          <div className="p-4 pt-0 sm:p-6">
            {/* Conversion */}
            <div className="mb-6 rounded-xl border border-[#0000000D] bg-[#B8B8B80D] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black text-sm">
                  CONVERSION:
                </span>
                <span className="font-medium text-lg">
                  ~{formatCurrency(yieldInUSD || 0, "USD")}
                </span>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-[#0000000D] bg-[#B8B8B80D] py-2">
              <h3 className="mb-3 px-3 font-semibold text-sm">FROM</h3>

              {/* USDC Deposit */}
              <div className="my-5 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/coins/usdc.png"
                    className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                    width={24}
                    height={24}
                    alt="USDC"
                  />
                  <span className="text-gray-400 text-sm">USDC DEPOSIT</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formatCurrency(yieldUSDC || 0n, "wBTC")}
                  </span>
                  <Image
                    src="/images/coins/btc.png"
                    className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                    width={24}
                    height={24}
                    alt="wBTC"
                  />
                </div>
              </div>

              {/* USDT Deposit */}
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Image
                    className="mt-1 mb-1.5 h-5 w-5 md:h-6 md:w-6"
                    src="/images/coins/usdt.png"
                    width={24}
                    height={24}
                    alt="USDT"
                  />
                  <span className="text-gray-400 text-sm">USDT DEPOSIT</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formatCurrency(yieldUSDT || 0n, "wBTC")}
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

            {/* Claim Button */}
            <Button
              className="relative flex w-full items-center justify-center gap-x-3 overflow-hidden rounded-xl bg-[var(--color-primary)] py-4 font-inter font-semibold text-base text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              onClick={handleClaim}
              disabled={(!yieldUSDC && !yieldUSDT) || isLoading}
            >
              <NoiseBackground
                className="absolute inset-0"
                opacity={0.3}
                intensity="medium"
              />

              {isLoading && (
                <motion.div
                  className="relative z-10 flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-[3px] w-[3px] bg-white"
                      animate={{
                        y: [0, -6, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              )}

              <div className="relative z-10 flex items-center gap-x-1">
                <span>{isLoading ? "Claiming..." : "Claim"}</span>
              </div>

              <motion.div
                animate={{
                  opacity: isLoading ? 0 : 1,
                  width: isLoading ? 0 : "auto",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative z-10 overflow-hidden"
              >
                <ChevronRight className="h-3 w-[7px] text-white/60" />
              </motion.div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Success Modal */}
      <ClaimSuccessModal
        open={transactionHash !== undefined}
        onOpenChange={() => {
          clearTransactionData();
        }}
        claimedAmount={claimedTotal || 0n}
        lastClaimedUSDC={lastClaimedUSDC || 0n}
        lastClaimedUSDT={lastClaimedUSDT || 0n}
        transactionHash={transactionHash}
      />
    </>
  );
}
