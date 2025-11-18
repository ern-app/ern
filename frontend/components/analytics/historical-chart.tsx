"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { useYieldStore } from "@/lib/yield-store";
import NoiseBackground from "../shared/noise-background";

export default function HistoricalChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useIsMobile(1024);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { yearlyData } = useYieldStore();
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const chartData = yearlyData.map((data) => ({
    year: data.year,
    value1: data.marketValue, // Market average
    value2: data.ernValue, // Ern value
    earned: data.btcEarned, // BTC earned
  }));

  // Calculate min and max values dynamically from data
  const allValues = chartData.flatMap((d) => [d.value1, d.value2]);
  const minValue =
    allValues.length > 0 ? Math.min(...allValues) * 0.95 : 100000;
  const maxValue =
    allValues.length > 0 ? Math.max(...allValues) * 1.05 : 125000;

  // Responsive height: 155px on mobile/tablet, 370px on desktop
  const containerHeightDesktop = 370;
  const containerHeightMobile = 155;
  const padding = 50;
  const paddingMobile = 30;

  const calculateHeight = (value: number, useMobileHeight = false) => {
    const containerHeight = useMobileHeight
      ? containerHeightMobile
      : containerHeightDesktop;
    const pad = useMobileHeight ? paddingMobile : padding;
    const maxHeight = containerHeight - pad;

    if (maxValue === minValue) return useMobileHeight ? 50 : 100;

    const percentage = (value - minValue) / (maxValue - minValue);
    return Math.max(useMobileHeight ? 20 : 40, percentage * maxHeight);
  };

  // Handle scroll to focus middle element on mobile and custom scrollbar
  // biome-ignore lint/correctness/useExhaustiveDependencies: previous team
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const isScrollable = container.scrollWidth > container.clientWidth;
      setShowScrollbar(isScrollable);
    };

    const handleScrollTracking = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const percentage =
        maxScroll > 0 ? Math.min((scrollLeft / maxScroll) * 100, 100) : 0;
      setScrollPercentage(percentage);
    };

    const handleScroll = () => {
      // Handle scroll tracking for custom scrollbar
      handleScrollTracking();

      // Handle mobile focus behavior
      if (!isMobile) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      const chartElements = container.querySelectorAll("[data-chart-item]");
      let closestIndex = 0;
      let closestDistance = Infinity;

      chartElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.left + rect.width / 2;
        const distance = Math.abs(elementCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setHoveredIndex(closestIndex);
    };

    checkScrollable();
    handleScroll();

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollable);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollable);
    };
  }, [isMobile, chartData.length]);

  return (
    <div>
      <h2 className="mt-[26px] text-end font-medium text-[10px] text-black sm:text-lg">
        Historical Comparison <br className="sm:hidden" /> 2020-2025
      </h2>

      <div
        ref={scrollContainerRef}
        className="custom-scrollbar h-[240px] overflow-x-auto px-5 md:overflow-x-hidden lg:h-[460px]"
      >
        <div className="flex h-full min-w-fit items-end justify-between gap-x-4 font-inter sm:gap-x-5 lg:gap-[36px] lg:gap-x-0">
          {chartData.map((item, index) => {
            const height1 = calculateHeight(item.value1, isMobile);
            const height2 = calculateHeight(item.value2, isMobile);
            const isHovered = hoveredIndex === index;
            const shouldDim = hoveredIndex !== null && !isHovered;

            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: previous team
              // biome-ignore lint/a11y/useKeyWithClickEvents: previous team
              <div
                key={item.year}
                data-chart-item
                className="relative flex w-fit cursor-pointer flex-col space-y-2 sm:space-y-3 lg:cursor-default lg:space-y-4"
                onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                onClick={() => isMobile && setHoveredIndex(index)}
              >
                {/* Earned value display on hover/focus */}
                {isHovered && (
                  <div className="-top-[60px] lg:-top-[80px] -translate-x-1/2 absolute left-1/2 z-10 transform whitespace-nowrap text-center font-inter font-semibold text-black text-xs lg:text-[15px]">
                    <p>Earned:</p>

                    <div className="flex items-center justify-center gap-x-1">
                      <p>{item.earned.toFixed(5)}</p>
                      <Image
                        src="/images/coins/btc.png"
                        className="aspect-auto w-3.5"
                        width={14}
                        height={14}
                        alt="btc"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-end gap-x-1 transition-all sm:gap-x-2",
                    {
                      "opacity-30": shouldDim,
                      "opacity-100": !shouldDim,
                    },
                  )}
                >
                  <div className="space-y-1 lg:space-y-1.5">
                    <p className="text-center font-medium text-[8px] lg:font-semibold lg:text-[10px] xl:text-[12px]">
                      {item.value1.toLocaleString()}
                    </p>
                    <div
                      className="relative w-[30px] rounded-[6px] border-2 border-black/10 border-dashed bg-[#EFEEEA] lg:w-[45px] lg:rounded-[10px] xl:w-[63px]"
                      style={{ height: `${height1}px` }}
                    >
                      <NoiseBackground
                        intensity="high"
                        opacity={0.1}
                        className="rounded-[6px] lg:rounded-[10px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 lg:space-y-1.5">
                    <p className="text-center font-medium text-[8px] lg:font-semibold lg:text-[10px] xl:text-[12px]">
                      {item.value2.toLocaleString()}
                    </p>
                    <div
                      className="relative w-[30px] rounded-[6px] bg-[var(--color-primary)] lg:w-[45px] lg:rounded-[10px] xl:w-[63px]"
                      style={{ height: `${height2}px` }}
                    >
                      <NoiseBackground
                        intensity="high"
                        opacity={0.3}
                        className="rounded-[6px] lg:rounded-[10px]"
                      />
                      {/* Ern logo on hover/focus */}
                      {isHovered && (
                        <div className="absolute right-0 bottom-1 left-0 px-1 lg:bottom-2">
                          <Image
                            src="/images/ern-logo-white.svg"
                            className="mx-auto aspect-auto w-5/6"
                            width={63}
                            height={16}
                            alt="Ern"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "text-center font-medium text-[10px] text-black transition-all lg:text-lg",
                    {
                      "opacity-30": shouldDim,
                      "opacity-100": !shouldDim,
                    },
                  )}
                >
                  {item.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar indicator */}
      {showScrollbar && (
        <div className="mx-auto mt-3 h-1.5 w-[calc(100%-40px)] overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-400 transition-transform duration-100 ease-out will-change-transform"
            style={{
              width: "40%",
              transform: `translateX(${(scrollPercentage / 100) * 150}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
