"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { currencyFormatter, longDecimalsFormatter } from "@/helpers/formatter";
import { useYieldStore } from "@/lib/yield-store";
import NoiseBackground from "../shared/noise-background";

export default function Table() {
  const { yearlyData } = useYieldStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: previous team
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const checkScrollable = () => {
      const isScrollable =
        scrollContainer.scrollWidth > scrollContainer.clientWidth;
      setShowScrollbar(isScrollable);
    };

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const maxScroll =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const percentage =
        maxScroll > 0 ? Math.min((scrollLeft / maxScroll) * 100, 100) : 0;
      setScrollPercentage(percentage);
    };

    checkScrollable();
    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollable);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollable);
    };
  }, [yearlyData]);

  return (
    <div className="mt-10 w-full">
      {/* Desktop view - grid layout */}
      <div className="hidden w-full grid-cols-5 justify-between gap-5 md:grid">
        <div className="rounded-xl border-2 border-black/9 border-dashed px-4 py-6 lg:px-0 xl:rounded-[18px] xl:py-[42px]">
          <div className="flex flex-col items-center space-y-5 lg:space-y-[33px]">
            <h5 className="text-center font-medium text-[12px] md:text-base xl:text-xl">
              Year
            </h5>

            <div className="space-y-5 font-inter font-medium text-[10px] md:text-xs lg:space-y-[36px] xl:text-lg">
              {yearlyData.map((item) => (
                <p key={item.year}>{item.year}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-xl border-2 border-black/9 border-dashed bg-black/[0.05] px-4 py-6 lg:px-0 xl:rounded-[18px] xl:py-[42px]">
          <div className="flex flex-col items-center space-y-5 lg:space-y-[33px]">
            <h5 className="text-center font-medium text-[12px] md:text-base xl:text-xl">
              Market Average
            </h5>

            <div className="space-y-5 font-inter font-medium text-[10px] md:text-xs lg:space-y-[36px] xl:text-lg">
              {yearlyData.map((item) => (
                <p key={item.year}>
                  {currencyFormatter.format(item.marketValue)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1 rounded-xl border-2 border-black/9 border-dashed bg-[var(--color-primary)] px-4 py-6 lg:px-0 xl:rounded-[18px] xl:py-[42px]">
          <NoiseBackground intensity="high" opacity={0.2} />

          <div className="flex flex-col items-center space-y-5 lg:space-y-[33px]">
            <div className="text-center font-medium text-[12px] md:text-lg xl:text-xl">
              <Image
                src="/images/ern-logo-white.svg"
                className="aspect-auto w-auto"
                width={45}
                height={15}
                alt="ern-logo"
              />
            </div>

            <div className="space-y-5 font-inter font-medium text-[12px] text-white md:text-sm lg:space-y-[36px] xl:text-xl">
              {yearlyData.map((item) => (
                <p key={item.year}>{currencyFormatter.format(item.ernValue)}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-xl bg-[#F7F6F2] px-4 py-6 lg:px-0 xl:rounded-[18px] xl:py-[42px]">
          <div className="flex flex-col items-center space-y-5 lg:space-y-[33px]">
            <h5 className="text-center font-medium text-[12px] md:text-base xl:text-xl">
              Advantage
            </h5>

            <div className="space-y-5 font-inter font-medium text-[10px] md:text-xs lg:space-y-[36px] xl:text-lg">
              {yearlyData.map((item) => (
                <p key={item.year}>
                  {currencyFormatter.format(item.ernValue - item.marketValue)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-black/18 px-4 py-6 lg:px-0 xl:rounded-[18px] xl:py-[42px]">
          <div className="flex flex-col items-center space-y-5 lg:space-y-[33px]">
            <h5 className="text-center font-medium text-[12px] md:text-base xl:text-xl">
              Earned Bitcoin
            </h5>

            <div className="space-y-5 font-inter font-medium text-[10px] md:text-xs lg:space-y-[36px] xl:text-lg">
              {yearlyData.map((item) => (
                <p key={item.year}>
                  {longDecimalsFormatter.format(item.btcEarned)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view - sticky year column with horizontal scroll */}
      <div className="relative md:hidden">
        <div className="relative flex">
          {/* Sticky Year Column */}
          <div className="sticky left-0 z-10 min-w-[110px] bg-white sm:min-w-[150px]">
            <div className="h-full rounded-xl border-2 border-black/9 border-dashed py-6">
              <div className="flex flex-col items-center space-y-5">
                <h5 className="text-center font-medium text-[12px]">Year</h5>

                <div className="space-y-5 font-inter font-medium text-[10px]">
                  {yearlyData.map((item) => (
                    <p key={item.year}>{item.year}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator gradient */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-20 w-8 bg-gradient-to-l from-white via-white/50 to-transparent" />

          {/* Scrollable Columns */}
          <div
            ref={scrollRef}
            className="custom-scrollbar flex-1 overflow-x-auto md:overflow-x-hidden"
          >
            <div className="flex gap-3 pl-3">
              <div className="min-w-[110px] rounded-xl border-2 border-black/9 border-dashed bg-black/[0.05] px-2 py-6 sm:min-w-[150px] lg:px-0">
                <div className="flex flex-col items-center space-y-5">
                  <h5 className="text-center font-medium text-[12px]">
                    Market Average
                  </h5>

                  <div className="space-y-5 font-inter font-medium text-[10px]">
                    {yearlyData.map((item) => (
                      <p key={item.year}>
                        {currencyFormatter.format(item.marketValue)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative min-w-[110px] rounded-xl border-2 border-black/9 border-dashed bg-[var(--color-primary)] px-2 py-6 sm:min-w-[150px] lg:px-0">
                <NoiseBackground intensity="high" opacity={0.2} />

                <div className="flex flex-col items-center space-y-5">
                  <div className="font-medium text-[12px]">
                    <Image
                      src="/images/ern-logo-white.svg"
                      width={35}
                      height={12}
                      alt="ern-logo"
                    />
                  </div>

                  <div className="space-y-5 font-inter font-medium text-[11px] text-white">
                    {yearlyData.map((item) => (
                      <p key={item.year}>
                        {currencyFormatter.format(item.ernValue)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-w-[110px] rounded-xl bg-[#F7F6F2] px-2 py-6 sm:min-w-[150px] lg:px-0">
                <div className="flex flex-col items-center space-y-5">
                  <h5 className="text-center font-medium text-[12px]">
                    Advantage
                  </h5>

                  <div className="space-y-5 font-inter font-medium text-[10px]">
                    {yearlyData.map((item) => (
                      <p key={item.year}>
                        {currencyFormatter.format(
                          item.ernValue - item.marketValue,
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-w-[110px] rounded-xl border border-black/18 px-2 py-6 sm:min-w-[150px] lg:px-0">
                <div className="flex flex-col items-center space-y-5">
                  <h5 className="text-center font-medium text-[12px]">
                    Earned Bitcoin
                  </h5>

                  <div className="space-y-5 font-inter font-medium text-[10px]">
                    {yearlyData.map((item) => (
                      <p key={item.year}>
                        {longDecimalsFormatter.format(item.btcEarned)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom scrollbar indicator for mobile */}
        {showScrollbar && (
          <div className="mx-auto mt-3 h-1.5 w-[calc(100%-120px)] overflow-hidden rounded-full bg-gray-200 sm:w-[calc(100%-160px)]">
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
    </div>
  );
}
