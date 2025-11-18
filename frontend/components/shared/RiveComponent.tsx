"use client";

import { useRive } from "@rive-app/react-canvas";
import { useEffect } from "react";

interface RiveComponentProps {
  src: string;
  isHover?: boolean;
  loop?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function RiveComponent({
  src,
  isHover = false,
  loop = false,
  className = "",
  width = 500,
  height = 500,
}: RiveComponentProps) {
  const { rive, RiveComponent: RiveCanvas } = useRive({
    src,
    stateMachines: "machine",
    autoplay: loop,
  });

  useEffect(() => {
    if (rive) {
      if (loop) {
        rive.play();
      } else if (isHover) {
        rive.play();
      } else {
        rive.pause();
      }
    }
  }, [isHover, loop, rive]);

  return (
    <RiveCanvas
      className={className}
      style={{ width, height }}
      onMouseEnter={() => {
        if (rive && !loop) {
          rive.play();
        }
      }}
      onMouseLeave={() => {
        if (rive && !loop) {
          rive.pause();
        }
      }}
    />
  );
}
