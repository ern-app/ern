"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "./button";
import CustomConnectButton from "./custom-connect-button";
import NoiseBackground from "./noise-background";

export default function MenuTop() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [isLaunchAppHovered, setIsLaunchAppHovered] = useState(false);
  const [isLaunchAppPressed, setIsLaunchAppPressed] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 mx-auto flex w-full max-w-[1620px] items-center justify-between px-2 py-[15px] font-inter md:px-4 md:py-[30px]">
      <div className="flex items-center gap-x-4 md:gap-x-10">
        <Link href="/">
          <Image
            src="/images/ern-logo.svg"
            className="aspect-auto w-[55px] md:w-auto"
            width={85}
            height={28}
            alt="ern-logo"
          />
        </Link>

        <div className="hidden items-center gap-x-2 md:flex md:gap-x-4">
          <p className="hidden font-medium text-base text-black/50 lg:block">
            Yield Options:
          </p>

          <Button className="rounded-[6px] border border-black/6 bg-black/6 px-3 py-2 text-black text-sm md:px-4 md:py-3 md:text-base">
            Bitcoin
          </Button>
        </div>
      </div>

      {isDashboard ? (
        <CustomConnectButton />
      ) : (
        <div className="flex items-center gap-x-3.5">
          <Link href="/dashboard">
            <Button
              onMouseEnter={() => setIsLaunchAppHovered(true)}
              onMouseLeave={() => {
                setIsLaunchAppHovered(false);
                setIsLaunchAppPressed(false);
              }}
              onMouseDown={() => setIsLaunchAppPressed(true)}
              onMouseUp={() => setIsLaunchAppPressed(false)}
              className="relative flex items-center gap-x-2 rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-[6px] hover:bg-[var(--color-primary)]/80 md:gap-x-3 md:px-4 md:py-3"
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
                className="absolute inset-0 rounded-full"
                opacity={0.2}
                intensity="high"
              />

              <span
                className="text-[12px] text-white md:text-base"
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
                className="h-3 w-[7px] text-white/60"
                isHovered={isLaunchAppHovered}
              />
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
