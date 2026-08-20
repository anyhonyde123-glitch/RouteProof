"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
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
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-slate-700/80 bg-navy-900/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-muted focus:border-amber-brand/60 focus:outline-none focus:ring-2 focus:ring-amber-brand/20",
            error && "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/20",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        {!error && hint ? (
          <p className="text-xs text-slate-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
