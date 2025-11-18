import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "./use-is-mobile";

// Animation configuration constants
const ANIMATION_CONFIG = {
  SCROLL_DISTANCE: 400, // Total scroll needed to complete animation (reduced from 1000)
  REVERSE_THRESHOLD: 200, // Scroll position threshold to reverse animation
  MAX_PADDING: 50, // Maximum padding around image (px)
  MAX_BORDER_RADIUS: 20, // Maximum border radius (px)
  SPRING: {
    stiffness: 125, // Increased from 80 for more responsive animation
    damping: 25, // Increased from 25 for smoother but faster animation
    restDelta: 0.001,
  },
} as const;

export function useHeroAnimation() {
  // Scroll state management
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  const isMobile = useIsMobile();

  // Animation progress tracking
  const accumulatedScroll = useRef(0);
  const previousScrollY = useRef(0);
  const hasCompletedAnimation = useRef(false);

  // Motion values for smooth animations
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, ANIMATION_CONFIG.SPRING);

  // Transform progress to visual properties
  const imagePadding = useTransform(
    smoothProgress,
    [0, 1],
    [0, ANIMATION_CONFIG.MAX_PADDING],
  );
  const imageBorderRadius = useTransform(
    smoothProgress,
    [0, 1],
    [0, ANIMATION_CONFIG.MAX_BORDER_RADIUS],
  );

  useEffect(() => {
    if (isMobile) return;

    const updateAnimationProgress = (progress: number) => {
      accumulatedScroll.current = progress * ANIMATION_CONFIG.SCROLL_DISTANCE;
      rawProgress.set(progress);
    };

    const lockAnimationAtFullProgress = () => {
      updateAnimationProgress(1);
    };

    const completeAnimation = () => {
      setIsScrollEnabled(true);
      hasCompletedAnimation.current = true;
    };

    const resetAnimation = () => {
      setIsScrollEnabled(false);
      hasCompletedAnimation.current = false;
    };

    // Handle wheel events during initial animation phase
    const handleWheelDuringAnimation = (e: WheelEvent) => {
      if (isScrollEnabled) return;

      e.preventDefault();

      // Accumulate scroll delta and clamp between 0 and max distance
      accumulatedScroll.current = Math.max(
        0,
        Math.min(
          ANIMATION_CONFIG.SCROLL_DISTANCE,
          accumulatedScroll.current + e.deltaY,
        ),
      );

      const progress =
        accumulatedScroll.current / ANIMATION_CONFIG.SCROLL_DISTANCE;
      rawProgress.set(progress);

      // Complete animation when progress reaches 100%
      if (progress >= 1 && !isScrollEnabled) {
        completeAnimation();
      }
    };

    // Handle scroll events to reverse animation when scrolling back to top
    const handleScrollBackToTop = () => {
      if (!isScrollEnabled) return;

      const currentScrollY = window.scrollY;
      const isScrollingUp = previousScrollY.current > currentScrollY;
      previousScrollY.current = currentScrollY;

      const isNearTop = currentScrollY <= ANIMATION_CONFIG.REVERSE_THRESHOLD;
      const shouldMaintainFullProgress =
        currentScrollY > ANIMATION_CONFIG.REVERSE_THRESHOLD ||
        hasCompletedAnimation.current;

      if (isNearTop && isScrollingUp) {
        // Reverse animation proportionally when scrolling up near top
        const reverseProgress =
          currentScrollY / ANIMATION_CONFIG.REVERSE_THRESHOLD;
        updateAnimationProgress(reverseProgress);

        // Reset to animation mode at the very top
        if (currentScrollY === 0) {
          resetAnimation();
        }
      } else if (shouldMaintainFullProgress) {
        // Lock animation at full progress during normal scrolling
        lockAnimationAtFullProgress();
      }
    };

    // Toggle scroll behavior and attach appropriate listeners
    if (!isScrollEnabled) {
      // Animation phase: prevent scrolling and capture wheel events
      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", handleWheelDuringAnimation, {
        passive: false,
      });
    } else {
      // Scroll phase: enable scrolling and monitor scroll position
      document.body.style.overflow = "";
      window.addEventListener("scroll", handleScrollBackToTop, {
        passive: true,
      });
    }

    // Cleanup listeners and restore overflow
    return () => {
      window.removeEventListener("wheel", handleWheelDuringAnimation);
      window.removeEventListener("scroll", handleScrollBackToTop);
      document.body.style.overflow = "";
    };
  }, [isScrollEnabled, rawProgress, isMobile]);

  return {
    isScrollEnabled,
    imagePadding,
    imageBorderRadius,
  };
}
