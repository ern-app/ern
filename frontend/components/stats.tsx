"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAaveAPYData } from "@/hooks/use-aave-apy";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  subLabel?: string;
  delay?: number;
  className?: string;
  isMain?: boolean;
  showCoinsOnMobile?: boolean;
}

function StatItem({
  label,
  subLabel,
  value,
  delay = 0,
  isMain = false,
  className,
  showCoinsOnMobile = false,
}: StatItemProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    setDisplayValue("");

    const timeout = setTimeout(() => {
      const hasNumbers = /\d/.test(value);

      if (hasNumbers) {
        const match = value.match(/^([\d,.]+)(.*)$/);
        if (!match) return;

        const [, numStr, suffix] = match;
        const targetNum = parseFloat(numStr.replace(",", "."));
        const duration = 1000;
        const steps = 90; // More steps for smoother animation
        const stepDuration = duration / steps;
        const useComma = numStr.includes(",");

        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - (1 - progress) ** 3; // ease-out cubic
          const currentNum = targetNum * easeProgress;

          const formattedNum = currentNum.toFixed(2);
          const finalNum = useComma
            ? formattedNum.replace(".", ",")
            : formattedNum;
          setDisplayValue(finalNum + suffix);

          if (progress >= 1) {
            clearInterval(interval);
            setDisplayValue(value);
          }
        }, stepDuration);

        return () => clearInterval(interval);
      } else {
        // Typing animation for text
        const textDuration = 1000;
        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / textDuration, 1);

          setDisplayValue(value.slice(0, Math.floor(progress * value.length)));

          if (progress >= 1) {
            clearInterval(interval);
            setDisplayValue(value);
          }
        }, 50); // Faster updates for smoother text animation

        return () => clearInterval(interval);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return (
    <div ref={elementRef} className={cn("space-y-2 md:space-y-3", className)}>
      <div>
        <p className="font-inter text-[11px] text-black/60 md:text-base">
          {label}
        </p>
        {subLabel && (
          <p className="h-0 text-[9px] text-black/30 sm:text-[10px]">
            {subLabel}
          </p>
        )}
      </div>
      {showCoinsOnMobile ? (
        <>
          <div className="relative mt-3.5 flex items-center md:hidden">
            <Image
              src="/images/coins/usdt.png"
              width={45}
              height={45}
              unoptimized={true}
              alt="USDT"
            />
            <Image
              src="/images/coins/usdc.png"
              className="relative right-4"
              width={45}
              height={45}
              unoptimized={true}
              alt="USDC"
            />
          </div>
          <p
            className={cn(
              "hidden h-[65px] font-medium text-[53px] text-black md:block md:min-h-[92px] md:text-4xl lg:text-5xl 2xl:text-[77px]",
              {
                "opacity-100": isMain,
                "opacity-60": !isMain,
              },
            )}
          >
            {displayValue}
          </p>
        </>
      ) : (
        <div className="relative">
          {/* Hidden element to reserve width */}
          <p
            className={cn(
              "invisible h-[65px] font-medium text-[53px] text-black leading-[115%] md:min-h-[92px] md:text-4xl lg:text-5xl 2xl:text-[77px]",
              {
                "opacity-100": isMain,
                "opacity-60": !isMain,
              },
            )}
          >
            {value}
          </p>
          {/* Visible animated element positioned absolutely */}
          <p
            className={cn(
              "absolute top-0 left-0 h-[65px] font-medium text-[53px] text-black leading-[115%] md:min-h-[92px] md:text-4xl lg:text-5xl 2xl:text-[77px]",
              {
                "opacity-100": isMain,
                "opacity-60": !isMain,
              },
            )}
          >
            {displayValue}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { data, isLoading, error } = useAaveAPYData();

  const getCurrentAPY = () => {
    if (
      isLoading ||
      error ||
      !data?.latest?.usdc?.apy ||
      !data?.latest?.usdt?.apy
    ) {
      return "0%";
    }

    const usdcAPY = data.latest.usdc.apy;
    const usdtAPY = data.latest.usdt.apy;
    const maxAPY = Math.max(usdcAPY, usdtAPY);

    const deductedAPY = maxAPY * 0.9; // Apply 10% platform fee
    return `${deductedAPY.toFixed(2)}%`;
  };

  const currentAPY = getCurrentAPY();

  const getHighestAPY = () => {
    if (isLoading || error || !data?.highest) {
      return "0%";
    }

    const deductedAPY = data.highest * 0.9; // Apply 10% platform fee
    return `${deductedAPY.toFixed(2)}%`;
  };

  const highestAPY = getHighestAPY();

  return (
    <div className="mx-auto mt-5 w-full px-5 md:px-20 lg:mt-[95px]">
      <div className="grid grid-cols-2 gap-y-7 md:flex md:flex-row md:justify-between">
        <StatItem
          label="Current APY"
          subLabel="* Updated hourly"
          value={currentAPY}
          delay={0}
          isMain={true}
        />
        <StatItem
          label="Highest Daily APY"
          subLabel="* Over the last 12 months"
          value={highestAPY}
          delay={200}
          className="justify-self-start md:justify-self-auto"
        />
        <StatItem
          label="Deposit Stablecoins"
          value="USDC & USDT"
          delay={400}
          showCoinsOnMobile={true}
        />
        <StatItem
          label="Daily Payout"
          value="Bitcoin"
          delay={600}
          className="justify-self-start md:justify-self-auto"
        />
      </div>
    </div>
  );
}
