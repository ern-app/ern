"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { formatWithCommas } from "@/helpers/format-with-commas";
import { getTokenIcon } from "@/helpers/get-token-icon";
import type { Underlying } from "@/lib/wagmi/types";
import Input from "../shared/input";

type AmountInputProps = {
  amount: string;
  isLoading: boolean;
  underlyingToken: Underlying;
  onAmountChange: (amount: string) => void;
  onTokenModalOpen: () => void;
  disabled?: boolean;
};

export function AmountInput({
  amount,
  isLoading,
  underlyingToken,
  onAmountChange,
  onTokenModalOpen,
  disabled = false,
}: AmountInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Format display value based on focus state
  const displayValue = isInputFocused ? amount : formatWithCommas(amount);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow numbers and decimal point
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      onAmountChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <>
      {/* Mobile Token Selector */}
      <div className="mb-3 flex justify-end lg:hidden">
        <button
          type="button"
          onClick={() => !isLoading && onTokenModalOpen()}
          className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[#F7F5F1] p-[8px] transition-colors hover:bg-gray-200 disabled:opacity-50"
          disabled={isLoading}
        >
          <Image
            src={getTokenIcon(underlyingToken)}
            alt={underlyingToken}
            width={24}
            height={24}
            className="h-5 w-5 md:h-6 md:w-6"
          />
          <span className="font-medium text-[14px]">{underlyingToken}</span>
          <ChevronDown className="h-4 w-4 text-black/30" />
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-[12px] rounded-3xl bg-white">
        <div className="flex items-center justify-between rounded-xl bg-[#F7F5F1] p-[12px] pl-[20px]">
          <Input
            type="text"
            value={displayValue}
            onChange={handleAmountChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            placeholder="0.00"
            className="w-full bg-transparent font-medium text-[16px] text-black outline-none md:text-[18px]"
          />
          <button
            type="button"
            className="hidden cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-white p-[4px] transition-colors hover:bg-white/80 disabled:cursor-default disabled:opacity-50 lg:flex"
            onClick={() => !isLoading && onTokenModalOpen()}
            disabled={disabled || isLoading}
          >
            <Image
              src={getTokenIcon(underlyingToken)}
              alt={underlyingToken}
              width={24}
              height={24}
              className="h-5 w-5 md:h-6 md:w-6"
            />
            <span className="">{underlyingToken}</span>
            <ChevronDown className="mr-2 min-h-4 min-w-4 text-black/30" />
          </button>
        </div>
      </div>
    </>
  );
}
