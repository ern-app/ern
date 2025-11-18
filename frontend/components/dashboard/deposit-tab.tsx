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
  useReadErc20Allowance,
  useReadErc20BalanceOf,
  useReadErnClaimableYield,
  useWriteErc20Approve,
  useWriteErnDeposit,
} from "@/lib/wagmi/wagmi.generated";
import { queryClient } from "@/providers/providers";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "../shared/button";
import { AmountInput } from "./amount-input";
import { BalanceDisplay } from "./balance-display";
import DepositSuccessModal from "./deposit-success-modal";
import { TokenSelectorModal } from "./token-selector-modal";

export default function DepositTab() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [underlyingToken, setUnderlyingToken] = useState<Underlying>("USDC");
  const [lastDepositAmount, setLastDepositAmount] = useState<bigint>();
  const [lastClaimedYield, setLastClaimedYield] = useState<bigint>();
  const [transactionHash, setTransactionHash] = useState<string>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contracts = useContracts();
  const decimals =
    CURRENCY_DECIMALS[underlyingToken as keyof typeof CURRENCY_DECIMALS];
  const [vault, setVault] = useState<Address>(contracts.ernUSDC);
  const [underlying, setUnderlying] = useState<Address>(contracts.USDC);

  // react to underlying or chain change
  useEffect(() => {
    setVault(contracts[`ern${underlyingToken}` as keyof typeof contracts]);
    setUnderlying(contracts[underlyingToken as keyof typeof contracts]);
  }, [underlyingToken, contracts]);

  // underlying balance
  const { data: balance } = useReadErc20BalanceOf({
    address: underlying,
    args: address && [address],
  });

  // underlying allowance
  const { data: allowance, refetch: refetchAllowance } = useReadErc20Allowance({
    address: underlying,
    args: address && [address, vault],
  });

  // claimable yield for this vault
  const { data: claimableYield } = useReadErnClaimableYield({
    address: vault,
    args: address && [address],
  });

  const { writeContractAsync: writeContractAsyncApprove } =
    useWriteErc20Approve();
  const { writeContractAsync: writeContractAsyncDeposit } =
    useWriteErnDeposit();

  const depositAmountWei = amount ? parseUnits(amount, decimals) : 0n;
  const needsApproval =
    depositAmountWei > 0n &&
    (allowance === undefined || depositAmountWei > allowance);
  const hasBalance = balance !== undefined && depositAmountWei <= balance;
  const canDeposit = allowance !== undefined && !needsApproval;

  // Handle approve
  const handleApprove = async () => {
    if (!depositAmountWei) return;

    setIsLoading(true);
    const toastId = toast.loading(
      `Approving ${underlyingToken} for deposit...`,
    );

    try {
      const hash = await writeContractAsyncApprove({
        address: underlying,
        args: [vault, depositAmountWei],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success(`${underlyingToken} approval successful!`, {
          id: toastId,
        });
        await refetchAllowance();
      } else {
        toast.error(`${underlyingToken} approval failed`, { id: toastId });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmountWei) return;

    setIsLoading(true);
    setLastDepositAmount(depositAmountWei);
    setLastClaimedYield(claimableYield || 0n);
    const toastId = toast.loading(`Depositing ${underlyingToken}...`);

    try {
      const hash = await writeContractAsyncDeposit({
        address: vault,
        args: [depositAmountWei],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success(`${underlyingToken} deposit successful!`, {
          id: toastId,
        });
        setAmount("");
        setTransactionHash(hash);
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
      } else {
        toast.error(`${underlyingToken} deposit failed!`, { id: toastId });
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
    setLastDepositAmount(undefined);
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
        balance={balance}
        underlyingToken={underlyingToken}
        isLoading={isLoading}
        onAmountChange={setAmount}
      />

      {/* Action Button */}
      {!isConnected ? (
        <CustomConnectButton className="mb-3 w-full" />
      ) : needsApproval ? (
        <Button
          className="relative mb-2 flex w-full items-center justify-center gap-x-3 overflow-hidden rounded-[12px] bg-[var(--color-primary)] py-[14px] font-medium text-[14px] text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50 md:py-[17px] md:text-[16px]"
          onClick={handleApprove}
          disabled={isLoading || !hasBalance}
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
            <span>{isLoading ? "Approving..." : "Approve"}</span>
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
      ) : (
        <Button
          className="relative mb-2 flex w-full items-center justify-center gap-x-3 overflow-hidden rounded-[12px] bg-[var(--color-primary)] py-[14px] font-medium text-[14px] text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50 md:py-[17px] md:text-[16px]"
          onClick={handleDeposit}
          disabled={!amount || isLoading || !hasBalance || !canDeposit}
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
            <span>{isLoading ? "Depositing..." : "Deposit"}</span>
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
          Insufficient {underlyingToken} balance!
        </div>
      )}

      {/* Info Text */}
      <p className="mb-6 font-inter text-[#1D1D1D]/50 text-xs md:mb-8 md:text-sm">
        * Each time you make a new deposit, the earned wBTC balance is
        automatically claimed and sent to your address.
      </p>

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={(token) => setUnderlyingToken(token)}
        selectedToken={underlyingToken}
        mode="deposit"
      />

      {/* Deposit Success Modal */}
      <DepositSuccessModal
        open={transactionHash !== undefined}
        onOpenChange={() => {
          clearTransactionData();
        }}
        depositedAmount={lastDepositAmount || 0n}
        currency={underlyingToken}
        transactionHash={transactionHash}
        claimedYield={lastClaimedYield}
      />
    </div>
  );
}
