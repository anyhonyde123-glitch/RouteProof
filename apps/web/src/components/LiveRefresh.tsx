"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Lightweight live refresh for on-chain state.
 * Polls router.refresh so Server Components re-read Soroban without a full reload.
 */
export function LiveRefresh({
  intervalMs = 12_000,
  label = "Live",
}: {
  intervalMs?: number;
  label?: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      router.refresh();
      setLastRefresh(new Date());
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, router]);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-muted">
      <span
        className={
          enabled
            ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300"
            : "inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-2.5 py-1"
        }
      >
        <span
          className={
            enabled
              ? "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
              : "h-1.5 w-1.5 rounded-full bg-slate-500"
          }
        />
        {label} {enabled ? "updating" : "paused"}
      </span>
      {lastRefresh ? (
        <span className="hidden sm:inline">
          {lastRefresh.toLocaleTimeString()}
        </span>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        aria-label={enabled ? "Pause live updates" : "Resume live updates"}
        onClick={() => setEnabled((v) => !v)}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
