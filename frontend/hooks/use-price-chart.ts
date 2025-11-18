"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCurrentPrice, fetchHistoricalPriceData } from "@/lib/alchemy/api";
import type { ChartDataPointT, TimeRangeT } from "@/lib/alchemy/types";
import {
  getDateRange,
  getInterval,
  getXAxisInterval,
} from "@/lib/alchemy/utils";
import { formatAlchemyData } from "@/lib/btc-historical-data";

type UsePriceChartProps = {
  currentPrice: number | null;
  priceChangePercentage24h: number | null;
  chartData: ChartDataPointT[];
  xAxisInterval: number;
  isCurrentPriceDataLoading: boolean;
  isHistoricalDataLoading: boolean;
  error: string | null;
  refetch: () => void;
  timeRange: TimeRangeT;
  setTimeRange: (range: TimeRangeT) => void;
};

export function usePriceChart(): UsePriceChartProps {
  const [timeRange, setTimeRange] = useState<TimeRangeT>("1W");

  const {
    data: currentPriceData,
    isLoading: isCurrentPriceDataLoading,
    error: currentPriceDataError,
  } = useQuery({
    queryKey: ["alchemy-current-price"],
    queryFn: () => fetchCurrentPrice("BTC"),
  });

  const {
    data: historicalData,
    isLoading: isHistoricalDataLoading,
    error: historicalDataError,
    refetch,
  } = useQuery({
    queryKey: ["alchemy-historical-data", timeRange],
    queryFn: () => {
      const { startTime, endTime } = getDateRange(timeRange);
      const interval = getInterval(timeRange);

      return fetchHistoricalPriceData(
        new Date(startTime),
        new Date(endTime),
        interval,
        "BTC",
      );
    },
  });

  const chartData = historicalData ? formatAlchemyData(historicalData) : [];

  const currentPrice = currentPriceData?.data?.[0]?.prices?.[0]?.value
    ? parseFloat(currentPriceData.data[0].prices[0].value)
    : null;

  const priceChangePercentage24h = (() => {
    if (!currentPrice || chartData.length === 0) return null;

    const startPrice = chartData[0].value;

    if (!startPrice) return null;

    return ((currentPrice - startPrice) / startPrice) * 100;
  })();

  return {
    currentPrice,
    priceChangePercentage24h,
    chartData,
    isCurrentPriceDataLoading,
    isHistoricalDataLoading,
    xAxisInterval: getXAxisInterval(chartData.length, timeRange),
    error:
      historicalDataError?.message || currentPriceDataError?.message || null,
    refetch,
    timeRange,
    setTimeRange,
  };
}
