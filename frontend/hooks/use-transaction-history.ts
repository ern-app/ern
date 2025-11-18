import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address, Log as ViemLog } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useContracts } from "@/lib/wagmi";
import {
  useWatchErc20ApprovalEvent,
  useWatchErnDepositEvent,
  useWatchErnWithdrawEvent,
  useWatchErnYieldClaimedEvent,
} from "@/lib/wagmi/wagmi.generated";
import type {
  TransactionHistoryStateT,
  TransactionT,
} from "@/types/transaction";

export function useTransactionHistory() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = useContracts();

  const [state, setState] = useState<TransactionHistoryStateT>({
    transactions: [],
    isLoading: false,
    error: null,
  });

  const fetchTransactions = useCallback(async () => {
    if (
      !address ||
      !contracts.ernUSDC ||
      !contracts.ernUSDT ||
      !contracts.USDC ||
      !contracts.USDT
    )
      return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        address,
        chainId: chainId.toString(),
        ernUSDC: contracts.ernUSDC,
        ernUSDT: contracts.ernUSDT,
        usdcToken: contracts.USDC,
        usdtToken: contracts.USDT,
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Deserialize the transactions (convert strings back to proper types)
      const transactions: TransactionT[] = data.transactions.map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
        blockNumber: BigInt(tx.blockNumber),
        amount: BigInt(tx.amount),
        ...(tx.fee && { fee: BigInt(tx.fee) }),
      }));

      setState({
        transactions,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch transaction history.",
      }));
    }
  }, [address, chainId, contracts]);

  // Initial fetch
  useEffect(() => {
    if (address) {
      fetchTransactions();
    }
  }, [address, fetchTransactions]);

  const refetch = useCallback(async () => {
    try {
      await fetchTransactions();
      toast.success("Transaction history refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh transaction history:", error);
      toast.error("Failed to refresh transaction history");
    }
  }, [fetchTransactions]);

  // Real-time event monitoring helper function
  const addNewTransaction = useCallback((transaction: TransactionT) => {
    setState((prev) => {
      const transactionExists = prev.transactions.some(
        (existing) => existing.id === transaction.id,
      );

      if (transactionExists) {
        return prev;
      }

      const updatedTransactions = [transaction, ...prev.transactions];
      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });
  }, []);

  // Real-time event watchers
  // USDC Vault watchers
  useWatchErnDepositEvent({
    address: contracts.ernUSDC,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDC,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const transaction = processTransactionEvent(
          log,
          "deposit",
          "USDC",
          contracts.ernUSDC,
        );
        addNewTransaction(transaction);
      });
    },
  });

  useWatchErnWithdrawEvent({
    address: contracts.ernUSDC,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDC,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const logWithArgs = log as any;
        const transaction = processTransactionEvent(
          log,
          "withdraw",
          "USDC",
          contracts.ernUSDC,
          {
            fee: logWithArgs.args?.fee as bigint,
          },
        );
        addNewTransaction(transaction);
      });
    },
  });

  useWatchErnYieldClaimedEvent({
    address: contracts.ernUSDC,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDC,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const transaction = processTransactionEvent(
          log,
          "earnings",
          "wBTC",
          contracts.ernUSDC,
        );
        addNewTransaction(transaction);
      });
    },
  });

  // USDT Vault watchers
  useWatchErnDepositEvent({
    address: contracts.ernUSDT,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDT,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const transaction = processTransactionEvent(
          log,
          "deposit",
          "USDT",
          contracts.ernUSDT,
        );
        addNewTransaction(transaction);
      });
    },
  });

  useWatchErnWithdrawEvent({
    address: contracts.ernUSDT,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDT,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const logWithArgs = log as any;
        const transaction = processTransactionEvent(
          log,
          "withdraw",
          "USDT",
          contracts.ernUSDT,
          {
            fee: logWithArgs.args?.fee as bigint,
          },
        );
        addNewTransaction(transaction);
      });
    },
  });

  useWatchErnYieldClaimedEvent({
    address: contracts.ernUSDT,
    args: { user: address as Address },
    enabled: !!address && !!contracts.ernUSDT,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const transaction = processTransactionEvent(
          log,
          "earnings",
          "wBTC",
          contracts.ernUSDT,
        );
        addNewTransaction(transaction);
      });
    },
  });

  // Token approval watchers
  useWatchErc20ApprovalEvent({
    address: contracts.USDC,
    args: {
      owner: address as Address,
      spender: [contracts.ernUSDC, contracts.ernUSDT].filter(
        Boolean,
      ) as Address[],
    },
    enabled: !!address && !!contracts.USDC,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const logWithArgs = log as any;
        const transaction = processTransactionEvent(
          log,
          "approval",
          "USDC",
          contracts.USDC,
          {
            spender: logWithArgs.args?.spender as string,
          },
        );
        addNewTransaction(transaction);
      });
    },
  });

  useWatchErc20ApprovalEvent({
    address: contracts.USDT,
    args: {
      owner: address as Address,
      spender: [contracts.ernUSDC, contracts.ernUSDT].filter(
        Boolean,
      ) as Address[],
    },
    enabled: !!address && !!contracts.USDT,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const logWithArgs = log as any;
        const transaction = processTransactionEvent(
          log,
          "approval",
          "USDT",
          contracts.USDT,
          {
            spender: logWithArgs.args?.spender as string,
          },
        );
        addNewTransaction(transaction);
      });
    },
  });

  return {
    ...state,
    refetch,
  };
}

function processTransactionEvent(
  event: ViemLog,
  action: TransactionT["action"],
  tokenSymbol: string,
  tokenAddress: string,
  additionalData?: { fee?: bigint; spender?: string },
): TransactionT {
  const eventWithArgs = event as any;
  const amount = eventWithArgs.args?.amount ?? eventWithArgs.args?.value;
  const date = eventWithArgs.blockTimestamp
    ? new Date(Number(eventWithArgs.blockTimestamp) * 1000)
    : new Date();

  const baseTransaction = {
    id: `${eventWithArgs.transactionHash}-${eventWithArgs.logIndex}`,
    hash: eventWithArgs.transactionHash,
    action,
    asset: tokenSymbol,
    assetIcon: tokenSymbol,
    value: amount?.toString() || "0",
    date,
    blockNumber: eventWithArgs.blockNumber,
    user: (eventWithArgs.args?.user ?? eventWithArgs.args?.owner) as string,
    amount: amount as bigint,
    tokenAddress,
  };

  // Add required properties for specific transaction types
  if (action === "approval" && additionalData?.spender) {
    return {
      ...baseTransaction,
      amount: amount as bigint,
      spender: additionalData.spender,
    } as TransactionT;
  }

  if (action === "withdraw" && additionalData?.fee) {
    return {
      ...baseTransaction,
      fee: additionalData.fee,
    } as TransactionT;
  }

  return baseTransaction as TransactionT;
}
