"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currencyFormatter } from "@/helpers/formatter";
import { usePriceChart } from "@/hooks/use-price-chart";
import type { TimeRangeT } from "@/lib/alchemy/types";
import { formatTimeLabel } from "@/lib/alchemy/utils";
import { cn } from "@/lib/utils";

const timeRanges: TimeRangeT[] = [
  "1D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
  "YTD",
] as const;

export default function PriceChart() {
  const {
    currentPrice,
    priceChangePercentage24h,
    chartData,
    xAxisInterval,
    isCurrentPriceDataLoading,
    isHistoricalDataLoading,
    error,
    timeRange,
    setTimeRange,
  } = usePriceChart();

  const isPositive = priceChangePercentage24h && priceChangePercentage24h >= 0;
  const isNegative = priceChangePercentage24h && priceChangePercentage24h < 0;

  // Determine if we should rotate X-axis labels based on actual X-axis label count
  const actualXAxisLabelCount = Math.floor(chartData.length / xAxisInterval);
  const shouldRotateLabels = timeRange !== "1D" && actualXAxisLabelCount > 10;

  // Calculate dynamic Y-axis domain for better price difference visibility
  const getYAxisDomain = () => {
    if (chartData.length === 0) return ["dataMin", "dataMax"];

    const prices = chartData.map((point) => point.value);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add padding to show price movements more clearly
    const padding = priceRange * 0.1; // 10% padding

    return [minPrice - padding, maxPrice + padding];
  };

  return (
    <div className="flex min-w-0 flex-col rounded-[20px] bg-[#F7F6F2] p-4 pb-[20px] font-inter sm:p-[16px] md:p-[28px] md:pb-[36px] lg:h-full">
      {/* Header */}
      <div>
        <div className="flex flex-col items-start justify-between xl:flex-row">
          <div className="min-w-0 shrink">
            <h3 className="font-medium text-[14px] text-black sm:text-[16px] md:text-[20px]">
              BTC/USDT
            </h3>
            <p className="break-words font-bold text-[24px] sm:text-[32px] xl:text-[54px]">
              {isCurrentPriceDataLoading
                ? "Loading..."
                : currencyFormatter.format(Number(currentPrice || 0))}
            </p>
          </div>
          {/* Desktop Time Range Selector */}
          <div className="hidden gap-2 lg:flex">
            {timeRanges.map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "cursor-pointer rounded-full px-2 py-1 font-medium text-xs transition-colors lg:py-2 xl:px-3 xl:py-1",
                  {
                    "bg-white text-black": timeRange === range,
                    "text-black/50": timeRange !== range,
                  },
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          {(isCurrentPriceDataLoading || isHistoricalDataLoading) && (
            <span className="text-black/40">Loading...</span>
          )}

          {error && <span className="text-red-500">{error}</span>}

          {!isCurrentPriceDataLoading && !isHistoricalDataLoading && !error && (
            <>
              <span
                className={cn("flex items-center gap-1", {
                  "text-[#50AF95]": isPositive,
                  "text-[#E74C3C]": isNegative,
                })}
              >
                {isPositive && <TrendingUp className="aspect-auto w-4" />}
                {isNegative && <TrendingDown className="aspect-auto w-4" />}
                {priceChangePercentage24h?.toFixed(2)}%
              </span>
              <span className="text-black/40">• {timeRange}</span>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative mt-5 h-[250px] min-h-0 w-full sm:h-[300px] lg:h-[400px]">
        {isHistoricalDataLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-black/40">Loading chart data...</div>
          </div>
        )}

        {error && !isHistoricalDataLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-red-500">Failed to load chart data</div>
          </div>
        )}

        {!isHistoricalDataLoading && !error && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={0}
                padding={{ left: 10, right: 10 }}
                angle={shouldRotateLabels ? -60 : 0}
                textAnchor={shouldRotateLabels ? "end" : "middle"}
                height={shouldRotateLabels ? 60 : 30}
                minTickGap={timeRange === "1D" ? 20 : 10}
                className="font-medium text-[8px] text-black sm:text-[10px] 2xl:text-xs"
                tickFormatter={(value: string, index: number) => {
                  // Only show labels at specific intervals
                  const shouldShowTick = index % xAxisInterval === 0;
                  if (!shouldShowTick) return "";

                  // Format the timestamp for display
                  const timestamp = parseInt(value);
                  return formatTimeLabel(timestamp, timeRange);
                }}
              />
              <YAxis hide domain={getYAxisDomain()} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#000", fontWeight: 500 }}
                itemStyle={{ color: "#FF6B35" }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "BTC/USDT",
                ]}
                labelFormatter={(label: string, payload: readonly any[]) => {
                  if (payload && payload.length > 0) {
                    const timestamp = payload[0].payload.timestamp;
                    const date = new Date(timestamp);

                    // Format based on time range for better tooltip display
                    switch (timeRange) {
                      case "1D":
                        return date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      case "1W":
                        return date.toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      case "1M":
                      case "3M":
                      case "6M":
                        return date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      case "1Y":
                      case "YTD":
                        return date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      default:
                        return date.toLocaleString();
                    }
                  }
                  return label;
                }}
                allowEscapeViewBox={{ x: false, y: false }}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF6B35"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div
          className="pointer-events-none absolute top-0 left-0 w-10 sm:w-20"
          style={{
            height: "calc(100% - 40px)",
            background: "linear-gradient(to right, #F7F6F2, transparent)",
          }}
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-10 sm:w-20"
          style={{
            height: "calc(100% - 40px)",
            background: "linear-gradient(to left, #F7F6F2, transparent)",
          }}
        />
      </div>

      {/* Mobile/Tablet Time Range Selector */}
      <div className="mt-3 flex gap-1 rounded-full bg-white p-[6px] lg:hidden">
        {timeRanges.map((range) => (
          <button
            type="button"
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "flex-1 rounded-full px-2 py-2 font-medium text-[11px] transition-colors",
              {
                "bg-[#F7F6F2] text-black": timeRange === range,
                "bg-transparent text-black/50": timeRange !== range,
              },
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
