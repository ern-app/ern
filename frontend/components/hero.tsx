"use client";

import Link from "next/link";
import { useState } from "react";
import { useHeroAnimation } from "@/hooks/use-hero-animation";
import ChevronRight from "@/public/icons/chevron-right";
import AnimatedHeroBackground from "./shared/animated-hero-background";
import Button from "./shared/button";
import NoiseBackground from "./shared/noise-background";

export default function Hero() {
  const { isScrollEnabled, imagePadding, imageBorderRadius } =
    useHeroAnimation();
  const [isLaunchAppHovered, setIsLaunchAppHovered] = useState(false);
  const [isLaunchAppPressed, setIsLaunchAppPressed] = useState(false);

  return (
    <AnimatedHeroBackground
      isScrollEnabled={isScrollEnabled}
      imagePadding={imagePadding}
      imageBorderRadius={imageBorderRadius}
    >
      <div className="absolute bottom-0 z-10 w-full pb-20 pl-[50px]">
        <div className="mx-auto">
          <div className="space-y-[18px]">
            <div className="font-instrument text-[96px] leading-[115%] tracking-[0.03em]">
              <h1 className="text-[var(--color-muted)]">Earn more,</h1>
              <h2 className="text-[var(--color-muted)]/80">Ern better.</h2>
            </div>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute right-[calc((100vw-100%-2rem)/2*-1)] left-0 h-[1px] bg-white/20" />
          </div>

          <div className="space-y-[21px]">
            <p className="font-instrument font-medium text-2xl text-[var(--color-muted)]/90">
              Your Stablecoins → Earning Bitcoin <br /> — every day.
            </p>

            <Link href="/dashboard">
              <Button
                onMouseEnter={() => setIsLaunchAppHovered(true)}
                onMouseLeave={() => {
                  setIsLaunchAppHovered(false);
                  setIsLaunchAppPressed(false);
                }}
                onMouseDown={() => setIsLaunchAppPressed(true)}
                onMouseUp={() => setIsLaunchAppPressed(false)}
                className="relative flex items-center gap-x-2 rounded-[6px] border border-white/20 bg-white px-3 py-[5px] hover:bg-white/80 md:gap-x-3 md:px-4 md:py-3"
                style={{
                  transform: isLaunchAppPressed
                    ? "scale(1)"
                    : isLaunchAppHovered
                      ? "scale(1.02)"
                      : "scale(1)",
                  transition: "transform 0.15s ease-out",
                }}
              >
                <NoiseBackground
                  className="absolute inset-0"
                  opacity={0.2}
                  intensity="high"
                />

                <span
                  className="text-[12px] text-black md:text-base"
                  style={{
                    transform: isLaunchAppPressed
                      ? "scale(1)"
                      : isLaunchAppHovered
                        ? "scale(1.02)"
                        : "scale(1)",
                    transition: "transform 0.15s ease-out",
                  }}
                >
                  Launch App
                </span>

                <ChevronRight
                  className="h-3 w-[7px] text-black/60"
                  isHovered={isLaunchAppHovered}
                  baseColor="bg-black/60"
                  hoverColor="bg-primary"
                />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedHeroBackground>
  );
}
