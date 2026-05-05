import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../utils/cn";

type PanelProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section className={cn("rounded-lg border border-line bg-panel shadow-panel", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({ className, children, ...props }: PanelProps) {
  return (
    <div className={cn("border-b border-line px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PanelBody({ className, children, ...props }: PanelProps) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
