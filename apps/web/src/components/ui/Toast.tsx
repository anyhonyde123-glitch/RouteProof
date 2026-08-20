"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ToastItem } from "@/lib/types";

export function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 shadow-card backdrop-blur-md",
              toast.variant === "success" &&
                "border-emerald-500/30 bg-emerald-500/10",
              toast.variant === "error" && "border-red-500/30 bg-red-500/10",
              toast.variant === "info" && "border-sky-500/30 bg-sky-500/10",
            )}
          >
            <div className="flex items-start gap-3">
              {toast.variant === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
              ) : null}
              {toast.variant === "error" ? (
                <XCircle className="mt-0.5 h-4 w-4 text-red-300" />
              ) : null}
              {toast.variant === "info" ? (
                <Info className="mt-0.5 h-4 w-4 text-sky-300" />
              ) : null}
              <div>
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs text-slate-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
