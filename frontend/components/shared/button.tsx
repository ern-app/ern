import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "cursor-pointer transition-all duration-300 disabled:cursor-default",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
