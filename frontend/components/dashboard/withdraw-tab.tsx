"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Address, parseUnits } from "viem";
import { useAccount } from "wagmi";
import CustomConnectButton from "@/components/shared/custom-connect-button";
import NoiseBackground from "@/components/shared/noise-background";
import { getErrorMessage } from "@/helpers/errors";
import { useContracts } from "@/lib/wagmi";
import { CURRENCY_DECIMALS } from "@/lib/wagmi/constants";
import type { Underlying } from "@/lib/wagmi/types";
import { publicClient } from "@/lib/wagmi/wagmi";
import {
  useReadErnBalanceOf,
  useReadErnClaimableYield,
  useReadErnIsLocked,
  useWriteErnWithdraw,
} from "@/lib/wagmi/wagmi.generated";
import { queryClient } from "@/providers/providers";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "../shared/button";
import { AmountInput } from "./amount-input";
import { BalanceDisplay } from "./balance-display";
import { TokenSelectorModal } from "./token-selector-modal";
import WithdrawSuccessModal from "./withdraw-success-modal";

export default function WithdrawTab() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [underlyingToken, setUnderlyingToken] = useState<Underlying>("USDC");
  const [lastWithdrawAmount, setLastWithdrawAmount] = useState<bigint>();
  const [lastClaimedYield, setLastClaimedYield] = useState<bigint>();
  const [transactionHash, setTransactionHash] = useState<string>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contracts = useContracts();
  const decimals =
    CURRENCY_DECIMALS[underlyingToken as keyof typeof CURRENCY_DECIMALS];
  const [vault, setVault] = useState<Address>(contracts.ernUSDC);

  // react to underlying or chain change
  useEffect(() => {
    setVault(contracts[`ern${underlyingToken}` as keyof typeof contracts]);
  }, [underlyingToken, contracts]);

  // ern token balance (what user can withdraw)
  const { data: ernBalance } = useReadErnBalanceOf({
    address: vault,
    args: address && [address],
  });

  // check if user's tokens are locked
  const { data: isLocked } = useReadErnIsLocked({
    address: vault,
    args: address && [address],
  });

  // claimable yield for this vault
  const { data: claimableYield } = useReadErnClaimableYield({
    address: vault,
    args: address && [address],
  });

  const { writeContractAsync: writeContractAsyncWithdraw } =
    useWriteErnWithdraw();

  const withdrawAmountWei = amount ? parseUnits(amount, decimals) : 0n;
  const hasBalance =
    ernBalance !== undefined && withdrawAmountWei <= ernBalance;
  const tokensAreLocked = isLocked === true;

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmountWei) return;

    setIsLoading(true);
    setLastWithdrawAmount(withdrawAmountWei);
    setLastClaimedYield(claimableYield || 0n);
    const toastId = toast.loading(`Withdrawing ${underlyingToken}...`);

    try {
      const hash = await writeContractAsyncWithdraw({
        address: vault,
        args: [withdrawAmountWei],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success(`${underlyingToken} withdrawal successful!`, {
          id: toastId,
        });
        setAmount("");
        setTransactionHash(hash);
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
      } else {
        toast.error(`${underlyingToken} withdrawal failed!`, { id: toastId });
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
    setLastClaimedYield(undefined);
    setLastWithdrawAmount(undefined);
  };

  return (
    <div>
      {/* Amount Input */}
      <AmountInput
        amount={amount}
        isLoading={isLoading}
        underlyingToken={underlyingToken}
        onAmountChange={setAmount}
        onTokenModalOpen={() => setIsTokenModalOpen(true)}
      />

      {/* Balance Display */}
      <BalanceDisplay
        amount={amount}
        balance={ernBalance}
        underlyingToken={underlyingToken}
        isLoading={isLoading}
        onAmountChange={setAmount}
      />

      {/* Withdraw Button */}
      {!isConnected ? (
        <CustomConnectButton className="mb-3 w-full" />
      ) : (
        <Button
          className="relative mb-2 flex w-full items-center justify-center gap-x-3 overflow-hidden rounded-[12px] bg-[#2c2c24] py-[14px] font-medium text-[14px] text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50 md:py-[17px] md:text-[16px]"
          onClick={handleWithdraw}
          disabled={!amount || !hasBalance || tokensAreLocked || isLoading}
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
            <span>{isLoading ? "Withdrawing..." : "Withdraw"}</span>
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
      )}

      {/* Error Messages */}
      {!hasBalance && amount && (
        <div className="mt-2 text-center text-red-500 text-sm">
          Insufficient {underlyingToken} shares balance!
        </div>
      )}

      {tokensAreLocked && amount && (
        <div className="mt-2 text-center text-red-500 text-sm">
          Withdrawals within 48 hours of deposit incur a 0.10% fee
        </div>
      )}

      {/* Info Text */}
      <p className="mb-6 font-inter text-[#1D1D1D]/50 text-xs md:mb-8 md:text-sm">
        * Each time you make a new withdrawal, the earned wBTC balance is
        automatically claimed and sent to your address.
      </p>

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={(token) => setUnderlyingToken(token)}
        selectedToken={underlyingToken}
        mode="withdraw"
      />

      {/* Withdraw Success Modal */}
      <WithdrawSuccessModal
        open={transactionHash !== undefined}
        onOpenChange={() => {
          clearTransactionData();
        }}
        withdrawnAmount={lastWithdrawAmount || 0n}
        currency={underlyingToken}
        transactionHash={transactionHash}
        claimedYield={lastClaimedYield}
      />
    </div>
  );
}
