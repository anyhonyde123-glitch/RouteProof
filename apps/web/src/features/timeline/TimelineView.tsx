"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatTimestamp } from "@/lib/format";
import type { TimelineEvent } from "@/lib/types";

const iconMap = {
  status: Package,
  handoff: Handshake,
  inspection: ClipboardCheck,
  settlement: ShieldCheck,
} as const;

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-muted">No on-chain events recorded yet.</p>
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute bottom-2 left-5 top-2 w-px bg-slate-700/50" />
      {events.map((event, index) => {
        const Icon = iconMap[event.type] ?? CheckCircle2;
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 pl-0"
          >
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 bg-navy-900">
              <Icon className="h-5 w-5 text-amber-brand" />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-slate-700/40 bg-navy-900/50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{event.title}</p>
                <Badge variant="default">{formatTimestamp(event.timestamp)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-muted">{event.description}</p>
              {event.actor ? (
                <p className="mt-2 text-xs text-slate-muted">
                  Actor: {event.actor}
                </p>
              ) : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
