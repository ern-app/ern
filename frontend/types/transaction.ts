export type TransactionActionT =
  | "deposit"
  | "withdraw"
  | "earnings"
  | "approval";

export type BaseTransactionT = {
  id: string;
  hash: string;
  action: TransactionActionT;
  asset: string;
  assetIcon: string;
  value: string;
  date: Date;
  blockNumber: bigint;
  user: string;
};

export type DepositTransactionT = BaseTransactionT & {
  action: "deposit";
  amount: bigint;
  tokenAddress: string;
};

export type WithdrawTransactionT = BaseTransactionT & {
  action: "withdraw";
  amount: bigint;
  fee: bigint;
  tokenAddress: string;
};

export type YieldClaimTransactionT = BaseTransactionT & {
  action: "earnings";
  amount: bigint;
  tokenAddress: string;
};

export type ApprovalTransactionT = BaseTransactionT & {
  action: "approval";
  amount: bigint;
  spender: string;
  tokenAddress: string;
};

export type TransactionT =
  | DepositTransactionT
  | WithdrawTransactionT
  | YieldClaimTransactionT
  | ApprovalTransactionT;

export type TransactionHistoryStateT = {
  transactions: TransactionT[];
  isLoading: boolean;
  error: string | null;
};
