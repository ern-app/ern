"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { formatCurrency } from "@/helpers/format-currency";
import { useUSDPrice } from "@/hooks/use-oracle-price";
import { useContracts } from "@/lib/wagmi";
import type { Underlying } from "@/lib/wagmi/types";
import {
  useReadErc20BalanceOf,
  useReadErnBalanceOf,
} from "@/lib/wagmi/wagmi.generated";

type TokenSelectorMode = "deposit" | "withdraw";

type TokenSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Underlying) => void;
  selectedToken?: Underlying;
  mode?: TokenSelectorMode;
};

const tokens: { symbol: Underlying; name: string; logo: string }[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "/images/coins/usdc.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    logo: "/images/coins/usdt.png",
  },
];

export function TokenSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  mode = "deposit",
}: TokenSelectorModalProps) {
  const { address } = useAccount();
  const contracts = useContracts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTokens, setFilteredTokens] = useState(tokens);

  const { data: usdcErc20Balance } = useReadErc20BalanceOf({
    address: contracts.USDC,
    args: address && [address],
  });

  const { data: usdcErnBalance } = useReadErnBalanceOf({
    address: contracts.ernUSDC,
    args: address && [address],
  });

  const { data: usdtErc20Balance } = useReadErc20BalanceOf({
    address: contracts.USDT,
    args: address && [address],
  });

  const { data: usdtErnBalance } = useReadErnBalanceOf({
    address: contracts.ernUSDT,
    args: address && [address],
  });

  const usdcBalance = mode === "deposit" ? usdcErc20Balance : usdcErnBalance;
  const usdtBalance = mode === "deposit" ? usdtErc20Balance : usdtErnBalance;

  const { data: usdcUSDPrice } = useUSDPrice({
    amount: usdcBalance,
    currency: "USDC",
    oracle: contracts.oracleUSDC,
  });

  const { data: usdtUSDPrice } = useUSDPrice({
    amount: usdtBalance,
    currency: "USDT",
    oracle: contracts.oracleUSDT,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const filtered = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredTokens(filtered);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleTokenSelect = (token: (typeof tokens)[0]) => {
    onSelect(token.symbol);
    onClose();
  };

  const getTokenBalance = (symbol: Underlying) => {
    if (symbol === "USDC") return usdcBalance;
    if (symbol === "USDT") return usdtBalance;
    return 0n;
  };

  const getUSDPrice = (symbol: Underlying) => {
    if (symbol === "USDC") return usdcUSDPrice;
    if (symbol === "USDT") return usdtUSDPrice;
    return 0n;
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[99999] flex cursor-pointer items-start justify-center bg-black/50 pt-20 backdrop-blur-md"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={onClose}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="mx-4 w-full max-w-md cursor-auto overflow-hidden rounded-3xl bg-white font-inter shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="border-gray-100 border-b p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-xl">
                  Select Token
                </h2>
                <motion.button
                  onClick={onClose}
                  className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>

              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 placeholder-gray-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  // biome-ignore lint/a11y/noAutofocus: previous team
                  autoFocus
                />
              </div>
            </div>

            {/* Token List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  No tokens found
                </div>
              ) : (
                <div>
                  {filteredTokens.map((token, index) => {
                    const balance = getTokenBalance(token.symbol);
                    const usdPrice = getUSDPrice(token.symbol);

                    return (
                      <motion.button
                        key={token.symbol}
                        onClick={() => handleTokenSelect(token)}
                        className={`flex w-full cursor-pointer items-center justify-between border-gray-50 border-b p-4 transition-colors last:border-0 hover:bg-gray-50 ${
                          selectedToken === token.symbol ? "bg-orange-50" : ""
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            className="aspect-square w-10 flex-shrink-0 rounded-full"
                            src={token.logo}
                            width={40}
                            height={40}
                            alt={token.symbol}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">
                              {token.symbol}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {token.name}
                            </div>
                          </div>
                        </div>
                        <motion.div
                          className="text-right"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.05 + 0.1,
                          }}
                        >
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(balance || 0n, token.symbol)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {formatCurrency(usdPrice || 0n, "USD")}
                          </div>
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
