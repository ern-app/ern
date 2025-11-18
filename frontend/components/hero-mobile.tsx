"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "./shared/button";
import NoiseBackground from "./shared/noise-background";

export default function HeroMobile() {
  const [isLaunchAppHovered, setIsLaunchAppHovered] = useState(false);
  const [isLaunchAppPressed, setIsLaunchAppPressed] = useState(false);
  return (
    <div>
      <div className="relative mx-2 mt-[60px]">
        <Image
          src="/images/hero-background-mobile.png"
          className="rounded-3xl"
          width={1620}
          height={1000}
          unoptimized={true}
          priority={true}
          alt="hero-background-mobile"
        />

        <div className="absolute inset-0 z-10">
          <div className="p-3">
            <div>
              <div className="font-instrument text-[38px] leading-[115%] tracking-[0.03em]">
                <h1 className="text-[var(--color-muted)]">Earn more,</h1>
                <h2 className="text-[var(--color-muted)]/80">Ern better.</h2>
              </div>

              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute right-[-0.75rem] left-0 h-[1px] bg-white/20" />
              </div>

              <div className="flex flex-col items-start space-y-2">
                <p className="font-instrument font-medium text-[var(--color-muted)]/90 text-xs">
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
                    className="group relative flex items-center gap-x-2 rounded-[6px] border border-white/26 bg-white px-[10px] py-[7px] font-inter text-[12px] hover:bg-white/80"
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
                      style={{
                        transform: isLaunchAppPressed
                          ? "scale(1)"
                          : isLaunchAppHovered
                            ? "scale(1.04)"
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
                      hoverColor="bg-black"
                    />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex w-full items-center justify-start gap-x-4 px-4 py-4">
        <p className="block font-medium text-base text-black/50">
          Yield Options:
        </p>

        <Button className="rounded-[6px] border border-black/6 bg-black/6 px-3 py-2 text-black text-sm md:px-4 md:py-3 md:text-base">
          Bitcoin
        </Button>
      </div>
    </div>
  );
}
