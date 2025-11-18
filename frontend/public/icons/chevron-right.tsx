import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type ChevronRightProps = {
  className?: string;
  isHovered?: boolean;
  baseColor?: string;
  hoverColor?: string;
};

export default function ChevronRight({
  className,
  isHovered = false,
  baseColor = "bg-white/60",
  hoverColor = "bg-black",
}: ChevronRightProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("aspect-square h-[2.5px] w-[2.5px]", baseColor)} />
      <div
        className={cn(
          "aspect-square h-[2.5px] w-[2.5px] translate-x-[100%]",
          baseColor,
        )}
      />
      <div
        className={cn(
          "aspect-square h-[2.5px] w-[2.5px] translate-x-[200%]",
          baseColor,
        )}
      />
      <div
        className={cn(
          "aspect-square h-[2.5px] w-[2.5px] translate-x-[100%]",
          baseColor,
        )}
      />
      <div className={cn("aspect-square h-[2.5px] w-[2.5px]", baseColor)} />

      <motion.div
        className={cn(
          "absolute inset-0 aspect-square h-[2.5px] w-[2.5px]",
          hoverColor,
        )}
        initial={{ x: -6, scale: 0.2, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, scale: 1, opacity: 1 }
            : { x: -6, scale: 0.1, opacity: 0 }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 aspect-square h-[2.5px] w-[2.5px] translate-y-[100%]",
          hoverColor,
        )}
        initial={{ x: "calc(100% - 4.5px)", scale: 0.2, opacity: 0 }}
        animate={
          isHovered
            ? { x: "100%", scale: 1, opacity: 1 }
            : { x: "calc(100% - 4.5px)", scale: 0.1, opacity: 0 }
        }
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 aspect-square h-[2.5px] w-[2.5px] translate-y-[200%]",
          hoverColor,
        )}
        initial={{ x: "calc(200% - 3px)", scale: 0.2, opacity: 0 }}
        animate={
          isHovered
            ? { x: "200%", scale: 1, opacity: 1 }
            : { x: "calc(200% - 3px)", scale: 0.1, opacity: 0 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 aspect-square h-[2.5px] w-[2.5px] translate-y-[300%]",
          hoverColor,
        )}
        initial={{ x: "calc(100% - 4.5px)", scale: 0.2, opacity: 0 }}
        animate={
          isHovered
            ? { x: "100%", scale: 1, opacity: 1 }
            : { x: "calc(100% - 4.5px)", scale: 0.1, opacity: 0 }
        }
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 aspect-square h-[2.5px] w-[2.5px] translate-y-[400%]",
          hoverColor,
        )}
        initial={{ x: -6, scale: 0.3, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, scale: 1, opacity: 1 }
            : { x: -6, scale: 0.1, opacity: 0 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </div>
  );
}
