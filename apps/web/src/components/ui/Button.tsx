"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-amber-brand text-navy-950 hover:bg-amber-glow shadow-glow font-semibold",
      secondary:
        "border border-slate-700 bg-navy-800/80 text-slate-100 hover:border-amber-brand/50 hover:bg-navy-700",
      ghost: "text-slate-muted hover:bg-navy-800/60 hover:text-white",
      danger:
        "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/60 disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
