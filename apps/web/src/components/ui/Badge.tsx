import { cn } from "@/lib/cn";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "border-slate-600/60 bg-navy-800/80 text-slate-200",
    warning: "border-amber-brand/40 bg-amber-brand/10 text-amber-brand",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
