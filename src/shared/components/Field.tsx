import { forwardRef } from "react";
import type { InputHTMLAttributes, LabelHTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type FieldProps = PropsWithChildren<{
  label: string;
  hint?: string;
  className?: string;
}>;

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function InlineLabel({ className, children, ...props }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label className={cn("text-sm font-medium text-slate-700", className)} {...props}>
      {children}
    </label>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
      {...props}
    />
  );
});

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
      {...props}
    />
  );
}
