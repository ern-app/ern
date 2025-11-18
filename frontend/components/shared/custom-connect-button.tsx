"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { shortenAddress } from "@/helpers/shorten-address";
import ChevronRight from "@/public/icons/chevron-right";
import Button from "./button";
import NoiseBackground from "./noise-background";

type CustomConnectButtonProps = {
  onHover?: (hovered: boolean) => void;
  onPress?: (pressed: boolean) => void;
  className?: string;
};

export default function CustomConnectButton({
  onHover,
  onPress,
  className,
}: CustomConnectButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    onHover?.(false);
    onPress?.(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    onPress?.(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onPress?.(false);
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className={`relative flex items-center justify-center gap-x-2 rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-[6px] hover:bg-[var(--color-primary)]/80 md:gap-x-3 md:px-4 md:py-3 ${
                      className || ""
                    }`}
                    style={{
                      transform: isPressed
                        ? "scale(1)"
                        : isHovered
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
                      className="text-[14px] text-white md:text-base"
                      style={{
                        transform: isPressed
                          ? "scale(1)"
                          : isHovered
                            ? "scale(1.04)"
                            : "scale(1)",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      Connect Wallet
                    </span>

                    <ChevronRight
                      className="h-3 w-[7px] text-white/60"
                      isHovered={isHovered}
                    />
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className={`relative flex items-center justify-center gap-x-2 rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-[6px] hover:bg-[var(--color-primary)]/80 md:gap-x-3 md:px-4 md:py-3 ${
                      className || ""
                    }`}
                    style={{
                      transform: isPressed
                        ? "scale(1)"
                        : isHovered
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
                      className="text-[14px] text-white md:text-base"
                      style={{
                        transform: isPressed
                          ? "scale(1)"
                          : isHovered
                            ? "scale(1.04)"
                            : "scale(1)",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      Wrong network
                    </span>

                    <ChevronRight
                      className="h-3 w-[7px] text-white/60"
                      isHovered={isHovered}
                    />
                  </Button>
                );
              }

              return (
                <Button
                  onClick={openAccountModal}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  className={`relative flex items-center justify-center gap-x-2 rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-[6px] hover:bg-[var(--color-primary)]/80 md:gap-x-3 md:px-4 md:py-3 ${
                    className || ""
                  }`}
                  style={{
                    transform: isPressed
                      ? "scale(1)"
                      : isHovered
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
                    className="text-[14px] text-white md:text-base"
                    style={{
                      transform: isPressed
                        ? "scale(1)"
                        : isHovered
                          ? "scale(1.04)"
                          : "scale(1)",
                      transition: "transform 0.15s ease-out",
                    }}
                  >
                    {account?.displayName ||
                      shortenAddress(account?.address || "")}
                  </span>

                  <ChevronRight
                    className="h-3 w-[7px] text-white/60"
                    isHovered={isHovered}
                  />
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
