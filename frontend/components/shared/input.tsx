import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ ...props }: InputProps) {
  return <input {...props} className={cn("outline-none", props.className)} />;
}
