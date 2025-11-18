"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useYieldStore } from "@/lib/yield-store";
import NoiseBackground from "../shared/noise-background";

type TooltipPayloadT = {
  value: number;
  dataKey: string;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadT[];
  label?: string;
};

type CustomDotProps = {
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  r?: number;
};

// Custom dot component for small filled dots (always visible)
const CustomDot = ({ cx, cy, fill, r = 3 }: CustomDotProps) => {
  if (cx === undefined || cy === undefined) return null;

  return (
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={fill} strokeWidth={0} />
  );
};

// Custom active dot component for larger filled dots (on hover)
const CustomActiveDot = ({ cx, cy, fill, r = 6 }: CustomDotProps) => {
  if (cx === undefined || cy === undefined) return null;

  return (
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={fill} strokeWidth={2} />
  );
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/90 px-4 py-3 shadow-xl backdrop-blur-sm">
        <p className="mb-2 font-inter font-medium text-white/60 text-xs">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#EC662C]" />
            <span className="font-inter font-medium text-sm text-white">
              Ern: {payload[1]?.value?.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white" />
            <span className="font-inter font-medium text-sm text-white">
              Market: {payload[0]?.value?.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart() {
  const { yearlyData, initialDeposit } = useYieldStore();

  // Transform yearlyData to chart format with normalized values (0-100 scale)
  const growthData = useMemo(() => {
    if (!yearlyData.length) return [];

    return yearlyData.map((data) => {
      // Normalize to percentage of growth from initial deposit
      const marketGrowth =
        initialDeposit > 0
          ? ((data.marketValue - initialDeposit) / initialDeposit) * 100
          : 0;
      const ernGrowth =
        initialDeposit > 0
          ? ((data.ernValue - initialDeposit) / initialDeposit) * 100
          : 0;

      return {
        year: data.year.toString(),
        growth: ernGrowth, // Ern performance (orange)
        revenue: marketGrowth, // Market average (black)
      };
    });
  }, [yearlyData, initialDeposit]);

  const highestPointIndex = useMemo(() => {
    // Preselect the highest combined value so the tooltip is visible on load.
    if (!growthData.length) {
      return undefined;
    }

    let highestIndex = 0;
    let highestValue = Number.NEGATIVE_INFINITY;

    growthData.forEach((entry, index) => {
      const entryMax = Math.max(entry.growth, entry.revenue);
      if (entryMax > highestValue) {
        highestValue = entryMax;
        highestIndex = index;
      }
    });

    return highestIndex;
  }, [growthData]);

  return (
    <div className="relative flex h-full w-full flex-col rounded-[18px] border border-black/16 bg-[#191919] pt-5 lg:pt-[42px]">
      <NoiseBackground opacity={0.15} />
      <h2 className="px-[22px] font-medium text-2xl text-white lg:text-[30px]">
        Performance <br className="sm:hidden" /> Visualization
      </h2>

      <div className="mt-[54px] flex flex-1 flex-col justify-end lg:mt-[113px]">
        {/* Chart Container */}
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={growthData}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC662C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#EC662C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="year" hide={true} />

              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
                defaultIndex={highestPointIndex}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ffffff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={<CustomDot fill="#ffffff" />}
                activeDot={<CustomActiveDot fill="#ffffff" />}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="growth"
                stroke="#EC662C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGrowth)"
                dot={<CustomDot fill="#EC662C" />}
                activeDot={<CustomActiveDot fill="#EC662C" />}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Years Display */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2.5 font-inter lg:px-7 lg:pb-4">
          {growthData.map((item, index) => (
            <span
              key={item.year}
              className={cn(
                "font-medium text-[8px] text-white/80 sm:text-sm",
                index === 0 && "translate-x-0",
                index === growthData.length - 1 && "translate-x-0",
              )}
            >
              {item.year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
