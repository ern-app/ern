import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "../shared/button";

type FaqItemProps = {
  id: number;
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: (id: number) => void;
};

export default function FaqItem({
  id,
  question,
  answer,
  isExpanded,
  onToggle,
}: FaqItemProps) {
  return (
    <Button
      onClick={() => onToggle(id)}
      className="flex w-full gap-x-5 rounded-xl bg-[#F7F6F2] px-4 py-4 font-medium text-[#040404] transition-all hover:bg-[#E8E8E8] lg:rounded-[20px] lg:px-8 lg:py-6"
    >
      <div className="flex flex-1 flex-col text-start">
        <p className="font-medium text-sm sm:text-lg lg:text-2xl">{question}</p>
        <div
          className={cn(
            "overflow-y-auto transition-all duration-300 ease-in-out",
            {
              "max-h-40 pt-3 opacity-100": isExpanded,
              "max-h-0 opacity-0": !isExpanded,
            },
          )}
        >
          <p className="font-inter text-black/70 text-xs lg:text-sm">
            {answer}
          </p>
        </div>
      </div>

      <div className="flex h-5 w-5 items-center justify-center rounded border border-[#040404]">
        <ChevronDown
          size={14}
          className={cn(
            "text-[#040404] transition-transform duration-300 ease-in-out",
            isExpanded && "rotate-180",
          )}
        />
      </div>
    </Button>
  );
}
