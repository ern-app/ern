import { cn } from "@/lib/utils";

interface NoiseBackgroundProps {
  className?: string;
  opacity?: number;
  intensity?: "low" | "medium" | "high";
}

export default function NoiseBackground({
  className,
  opacity = 0.1,
  intensity = "medium",
}: NoiseBackgroundProps) {
  const getNoiseConfig = () => {
    switch (intensity) {
      case "low":
        return {
          baseFrequency: "3.0",
          numOctaves: "1",
          opacity1: opacity * 0.5,
          opacity2: opacity * 0.3,
          opacity3: opacity * 0.2,
        };
      case "high":
        return {
          baseFrequency: "1.0",
          numOctaves: "1",
          opacity1: opacity * 0.8,
          opacity2: opacity * 0.6,
          opacity3: opacity * 0.4,
        };
      default:
        return {
          baseFrequency: "2.0",
          numOctaves: "1",
          opacity1: opacity * 0.6,
          opacity2: opacity * 0.4,
          opacity3: opacity * 0.3,
        };
    }
  };

  const config = getNoiseConfig();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className,
      )}
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='turbulence' baseFrequency='${config.baseFrequency}' numOctaves='${config.numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${config.opacity1}'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='${config.baseFrequency}' numOctaves='${config.numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='${config.opacity2}'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='turbulence' baseFrequency='${config.baseFrequency}' numOctaves='${config.numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)' opacity='${config.opacity3}'/%3E%3C/svg%3E")
        `,
        backgroundBlendMode: "overlay",
      }}
    />
  );
}
