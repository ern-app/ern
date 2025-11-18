export type AlchemyHistoricalResponseT = {
  symbol: string;
  currency: string;
  data: Array<{ value: string; timestamp: string }>;
};

export type AlchemyCurrentPriceResponseT = {
  data: Array<{
    symbol: string;
    prices: Array<{
      currency: string;
      value: string;
      lastUpdatedAt: string;
    }>;
  }>;
};

export type ChartDataPointT = {
  value: number;
  timestamp: number;
};

export type TimeRangeT = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "YTD";
