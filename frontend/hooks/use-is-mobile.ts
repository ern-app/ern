import { useEffect, useState } from "react";

/**
 * Hook to detect if the current viewport is mobile (below breakpoint)
 * @param breakpoint - The pixel width to consider as mobile (default: 768)
 * @returns boolean indicating if the viewport is below the breakpoint
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [breakpoint]);

  return isMobile;
}
