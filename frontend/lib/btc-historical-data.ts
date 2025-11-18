// BTC Historical Price Data
// Data source: Alchemy API (JSON files 2020-2024, fetched data 2025+)
// Date range: 2020-01-01 to today

import btc2020 from "@/data/btc-2020.json";
import btc2021 from "@/data/btc-2021.json";
import btc2022 from "@/data/btc-2022.json";
import btc2023 from "@/data/btc-2023.json";
import btc2024 from "@/data/btc-2024.json";
import type {
  AlchemyHistoricalResponseT,
  ChartDataPointT,
} from "./alchemy/types";

// Format raw Alchemy response data to consistent ChartDataPointT format
export const formatAlchemyData = (
  response: AlchemyHistoricalResponseT,
): ChartDataPointT[] => {
  return response.data.map((point) => ({
    value: parseFloat(point.value),
    timestamp: new Date(point.timestamp).getTime(),
  }));
};

// Combine all 2020-2024 historical data
const getHistoricalData2020To2024 = (): ChartDataPointT[] => {
  return [
    ...formatAlchemyData(btc2020),
    ...formatAlchemyData(btc2021),
    ...formatAlchemyData(btc2022),
    ...formatAlchemyData(btc2023),
    ...formatAlchemyData(btc2024),
  ].sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Get daily BTC prices for a specific year (2020-2024 only)
 * @param year The year to get prices for (2020-2024)
 * @returns Array of daily close prices
 */
export const getDailyPricesForYear = (year: number): number[] => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  const historicalData = getHistoricalData2020To2024();

  return historicalData
    .filter(
      (point) =>
        point.timestamp >= startTimestamp && point.timestamp <= endTimestamp,
    )
    .map((point) => point.value);
};
