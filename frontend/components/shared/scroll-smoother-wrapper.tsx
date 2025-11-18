"use client";

import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

type ScrollSmootherWrapperProps = {
  children: ReactNode;
};

export default function ScrollSmootherWrapper({
  children,
}: ScrollSmootherWrapperProps) {
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let smoother: ScrollSmoother | null = null;

    // Only enable on md screens and larger (768px+)
    if (!isMobile && smoothWrapperRef.current && smoothContentRef.current) {
      smoother = ScrollSmoother.create({
        wrapper: smoothWrapperRef.current,
        content: smoothContentRef.current,
        smooth: 1.5,
        effects: true,
        smoothTouch: 0.1,
      });
    }

    return () => {
      smoother?.kill();
    };
  }, [isMobile]);

  return (
    <div id="smooth-wrapper" ref={smoothWrapperRef}>
      <div id="smooth-content" ref={smoothContentRef}>
        {children}
      </div>
    </div>
  );
}
