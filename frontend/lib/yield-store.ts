import { create } from "zustand";
import type { YearlyDataT } from "@/hooks/use-yield-data";

type UseYieldStoreProps = {
  initialDeposit: number;
  yearlyData: YearlyDataT[];
  totalMarketValue: number;
  totalErnValue: number;
  totalBtcEarned: number;
  advantage: number;
  performance: number;
};

export const useYieldStore = create<UseYieldStoreProps>(() => ({
  initialDeposit: 100000,
  yearlyData: [],
  totalMarketValue: 0,
  totalErnValue: 0,
  totalBtcEarned: 0,
  advantage: 0,
  performance: 0,
}));
