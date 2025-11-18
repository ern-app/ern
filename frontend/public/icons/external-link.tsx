import { cn } from "../../lib/utils";

type ExternalLinkProps = {
  className?: string;
};

export default function ExternalLink({ className }: ExternalLinkProps) {
  return (
    <svg
      width="13"
      height="12"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-3 w-[13px]", className)}
    >
      <title>External Link</title>
      <path
        d="M7.33333 5.16667L11.5 1M11.5 1H8.72222M11.5 1V3.77778M11.5 7.11111V9.88889C11.5 10.1836 11.3829 10.4662 11.1746 10.6746C10.9662 10.8829 10.6836 11 10.3889 11H2.61111C2.31643 11 2.03381 10.8829 1.82544 10.6746C1.61706 10.4662 1.5 10.1836 1.5 9.88889V2.11111C1.5 1.81643 1.61706 1.53381 1.82544 1.32544C2.03381 1.11706 2.31643 1 2.61111 1H5.38889"
        stroke="#6562FD"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
