import type { Currency } from "@/lib/wagmi/types";

export const getTokenIcon = (token: Currency): string => {
  switch (token) {
    case "USDC":
      return "/images/coins/usdc.png";
    case "USDT":
      return "/images/coins/usdt.png";
    case "wBTC":
      return "/images/coins/btc.png";
    default:
      return "/images/coins/usdc.png";
  }
};
