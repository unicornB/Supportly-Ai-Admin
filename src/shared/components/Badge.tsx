import type { PropsWithChildren } from "react";
import { cn } from "../utils/cn";

type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
  className?: string;
}>;

const tones: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function Badge({ tone = "slate", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
