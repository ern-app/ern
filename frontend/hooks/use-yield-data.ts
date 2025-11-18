"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchHistoricalPriceData } from "@/lib/alchemy/api";
import type { ChartDataPointT } from "@/lib/alchemy/types";
import {
  formatAlchemyData,
  getDailyPricesForYear,
} from "@/lib/btc-historical-data";

export type YearlyDataT = {
  year: number;
  marketValue: number;
  ernValue: number;
  btcEarned: number;
  btcPrice: number;
};

type UseYieldDataProps = {
  yearlyData: YearlyDataT[];
  totalMarketValue: number;
  totalErnValue: number;
  totalBtcEarned: number;
  advantage: number;
  performance: number;
  isLoading: boolean;
  error: string | null;
};

// Helper to calculate compound interest
const calculateCompoundInterest = (
  principal: number,
  rate: number,
  days: number,
): number => {
  const dailyRate = rate / 365;
  return principal * (1 + dailyRate) ** days - principal;
};

// Helper to calculate BTC accumulation with DCA
const calculateBtcAccumulation = (
  principal: number,
  rate: number,
  dailyPrices: number[],
): number => {
  const dailyRate = rate / 365;
  let totalBtc = 0;

  for (let day = 0; day < dailyPrices.length; day++) {
    const dailyYield = principal * dailyRate;
    const btcPrice = dailyPrices[day];

    if (!btcPrice || btcPrice <= 0) continue;

    const btcBought = dailyYield / btcPrice;
    totalBtc += btcBought;
  }

  return totalBtc;
};

// Fetch BTC data for 2025+
const fetchCurrentYearsData = async (): Promise<ChartDataPointT[]> => {
  const currentYear = new Date().getFullYear();
  const today = new Date();

  // Only fetch if we're in 2025 or later
  if (currentYear < 2025) {
    return [];
  }

  const allFetchedData: ChartDataPointT[] = [];

  // Fetch each full year from 2025 to previous year
  for (let year = 2025; year < currentYear; year++) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const response = await fetchHistoricalPriceData(
        startDate,
        endDate,
        "1d",
        "BTC",
      );

      allFetchedData.push(...formatAlchemyData(response));
    } catch (error) {
      console.error(`Error fetching BTC data for ${year}:`, error);
    }
  }

  // Fetch current year (partial: Jan 1st to today)
  try {
    const startDate = new Date(currentYear, 0, 1);
    const response = await fetchHistoricalPriceData(
      startDate,
      today,
      "1d",
      "BTC",
    );

    allFetchedData.push(...formatAlchemyData(response));
  } catch (error) {
    console.error(`Error fetching BTC data for ${currentYear}:`, error);
  }

  return allFetchedData.sort((a, b) => a.timestamp - b.timestamp);
};

export function useYieldData(
  initialDeposit: number,
  apy: number,
): UseYieldDataProps {
  const [yearlyData, setYearlyData] = useState<YearlyDataT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateYields = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!initialDeposit || initialDeposit <= 0) {
          setYearlyData([]);
          return;
        }

        const rate = apy / 100;
        const currentYear = new Date().getFullYear();
        const years: number[] = [];

        // Generate years from 2020 to current year
        for (let year = 2020; year <= currentYear; year++) {
          years.push(year);
        }

        // Fetch 2025+ data
        const fetchedData = await fetchCurrentYearsData();

        const calculatedYearlyData: YearlyDataT[] = [];
        let cumulativeMarketValue = initialDeposit;
        let totalBtc = 0;

        for (let i = 0; i < years.length; i++) {
          const year = years[i];
          const isFirstYear = i === 0;

          // Get daily prices
          let dailyPrices: number[];

          if (year <= 2024) {
            dailyPrices = getDailyPricesForYear(year);
          } else {
            // Filter fetched data for this year
            const yearDataPoints = fetchedData.filter(
              (point) => new Date(point.timestamp).getFullYear() === year,
            );
            dailyPrices = yearDataPoints.map((point) => point.value);
          }

          // Skip if no data
          if (!dailyPrices || dailyPrices.length === 0) {
            console.warn(`No BTC data available for ${year}, skipping`);
            continue;
          }

          const actualDays = dailyPrices.length;
          const endPrice = dailyPrices[dailyPrices.length - 1];

          if (!endPrice || endPrice <= 0) {
            console.warn(`Invalid BTC price for ${year}, skipping`);
            continue;
          }

          // Calculate market average
          const marketInterest = calculateCompoundInterest(
            isFirstYear ? initialDeposit : cumulativeMarketValue,
            rate,
            actualDays,
          );
          cumulativeMarketValue += marketInterest;

          // Calculate Ern strategy
          const btcEarned = calculateBtcAccumulation(
            initialDeposit,
            rate,
            dailyPrices,
          );

          totalBtc += btcEarned;

          const ernValue = initialDeposit + totalBtc * endPrice;

          calculatedYearlyData.push({
            year,
            marketValue: Math.round(cumulativeMarketValue),
            ernValue: Math.round(ernValue),
            btcEarned: totalBtc,
            btcPrice: endPrice,
          });
        }

        setYearlyData(calculatedYearlyData);
      } catch (err) {
        console.error("Error calculating yields:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setYearlyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    calculateYields();
  }, [initialDeposit, apy]);

  // Calculate totals from final year
  const totals = useMemo(() => {
    if (!yearlyData.length) {
      return {
        totalMarketValue: 0,
        totalErnValue: 0,
        totalBtcEarned: 0,
        advantage: 0,
        performance: 0,
      };
    }

    const finalYear = yearlyData[yearlyData.length - 1];
    const totalMarketValue = finalYear.marketValue;
    const totalErnValue = finalYear.ernValue;
    const advantage = totalErnValue - totalMarketValue;

    const marketNetYield = totalMarketValue - initialDeposit;
    const ernNetYield = totalErnValue - initialDeposit;
    const performance = marketNetYield > 0 ? ernNetYield / marketNetYield : 0;

    return {
      totalMarketValue,
      totalErnValue,
      totalBtcEarned: finalYear.btcEarned,
      advantage,
      performance,
    };
  }, [yearlyData, initialDeposit]);

  return {
    yearlyData,
    totalMarketValue: totals.totalMarketValue,
    totalErnValue: totals.totalErnValue,
    totalBtcEarned: totals.totalBtcEarned,
    advantage: totals.advantage,
    performance: totals.performance,
    isLoading,
    error,
  };
}
