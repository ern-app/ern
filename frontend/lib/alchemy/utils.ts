import { TIME_RANGE_TO_DAYS } from "./constants";
import type { TimeRangeT } from "./types";

// Get X-axis interval for clean label display
export const getXAxisInterval = (
  dataLength: number,
  timeRange: TimeRangeT,
): number => {
  switch (timeRange) {
    case "1D":
      // Show every 3rd hour label (8 labels total)
      return Math.max(1, Math.floor(dataLength / 8));
    case "1W":
      // Show every day label (7 labels total)
      return Math.max(1, Math.floor(dataLength / 7));
    case "1M":
      // Show every 4th day label (7-8 labels total)
      return Math.max(1, Math.floor(dataLength / 7));
    case "3M":
      // Show every 10th day label (9 labels total)
      return Math.max(1, Math.floor(dataLength / 9));
    case "6M":
    case "1Y":
    case "YTD":
      // Show every 15th day label (12 labels total)
      return Math.max(1, Math.floor(dataLength / 12));
    default:
      return 0;
  }
};

// Format time labels for X-axis display
export const formatTimeLabel = (
  timestamp: number,
  timeRange: TimeRangeT,
): string => {
  const date = new Date(timestamp);

  switch (timeRange) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    case "1W":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "1M":
    case "3M":
    case "6M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "1Y":
    case "YTD":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    default:
      return date.toLocaleDateString();
  }
};

// Get date range for time period
export const getDateRange = (
  timeRange: TimeRangeT,
): { startTime: string; endTime: string } => {
  const now = new Date();
  const endTime = now.toISOString();

  let startTime: Date;

  if (timeRange === "YTD") {
    startTime = new Date(now.getFullYear(), 0, 1); // Start of current year
  } else {
    const days = TIME_RANGE_TO_DAYS[timeRange];
    startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  return {
    startTime: startTime.toISOString(),
    endTime,
  };
};

// Get interval for time period
export const getInterval = (timeRange: TimeRangeT): string => {
  switch (timeRange) {
    case "1D":
      return "5m"; // 5 minutes for daily view
    case "1W":
    case "1M":
      return "1h"; // 1 hour for weekly/monthly view
    case "3M":
    case "6M":
    case "1Y":
    case "YTD":
      return "1d"; // 1 day for longer periods
    default:
      return "1d";
  }
};
