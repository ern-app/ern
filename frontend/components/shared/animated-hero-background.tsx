"use client";

import { type MotionValue, motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

type AnimatedHeroBackgroundProps = {
  isScrollEnabled: boolean;
  imagePadding: MotionValue<number>;
  imageBorderRadius: MotionValue<number>;
  children: ReactNode;
};

export default function AnimatedHeroBackground({
  isScrollEnabled,
  imagePadding,
  imageBorderRadius,
  children,
}: AnimatedHeroBackgroundProps) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: isScrollEnabled ? "auto" : "100vh",
      }}
    >
      {/* Hero container - Fixed during animation, relative after */}
      <motion.div
        style={{
          position: isScrollEnabled ? "relative" : "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "100vh",
          padding: imagePadding,
          zIndex: isScrollEnabled ? 1 : 40,
        }}
      >
        {/* Image wrapper with border radius animation */}
        <motion.div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: imageBorderRadius,
            overflow: "hidden",
          }}
        >
          {/* Hero background image */}
          <Image
            src="/images/hero-background.png"
            className="h-full w-full object-fill"
            width={1620}
            height={1000}
            unoptimized={true}
            priority={true}
            alt="hero-background"
          />

          {/* Content overlay */}
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
