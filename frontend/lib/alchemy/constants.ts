export const ALCHEMY_BASE_URL = "https://api.g.alchemy.com/prices/v1";

export const TIME_RANGE_TO_DAYS = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  YTD: 365, // Will be calculated dynamically in API function
} as const;
