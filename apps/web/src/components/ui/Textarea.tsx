"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-200"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[120px] w-full rounded-lg border border-slate-700/80 bg-navy-900/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-muted focus:border-amber-brand/60 focus:outline-none focus:ring-2 focus:ring-amber-brand/20",
            error && "border-red-400/60",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
