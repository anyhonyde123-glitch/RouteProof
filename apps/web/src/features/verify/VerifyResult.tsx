import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TimelineView } from "@/features/timeline/TimelineView";
import { buildShipmentTimeline } from "@/lib/events";
import {
  formatStatus,
  hashPreview,
  statusBadgeVariant,
  truncateAddress,
} from "@/lib/format";
import type {
  HandoffRecord,
  InspectionRecord,
  SettlementRecord,
  Shipment,
} from "@/lib/types";

export function VerifyResult({
  shipment,
  handoffs,
  inspection,
  settlement,
}: {
  shipment: Shipment;
  handoffs: HandoffRecord[];
  inspection: InspectionRecord | null;
  settlement: SettlementRecord | null;
}) {
  const timeline = buildShipmentTimeline({
    shipment,
    handoffs,
    inspection,
    settlement,
  });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-white">
              Shipment #{shipment.id} verified on chain
            </p>
            <p className="mt-1 text-sm text-slate-muted">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
          <Badge
            variant={statusBadgeVariant(shipment.status)}
            className="ml-auto shrink-0"
          >
            {formatStatus(shipment.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Participants
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {(
              [
                ["Sender", shipment.sender],
                ["Carrier", shipment.carrier],
                ["Warehouse", shipment.warehouse],
                ["Inspector", shipment.inspector],
                ["Receiver", shipment.receiver],
              ] as const
            ).map(([label, address]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-slate-muted">{label}</dt>
                <dd className="font-mono text-slate-200">
                  {truncateAddress(address, 8)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-slate-muted">
            Cargo hash: {hashPreview(shipment.cargo_hash, 24)}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Custody timeline
          </h2>
          <div className="mt-4">
            <TimelineView events={timeline} />
          </div>
        </section>
      </div>

      <p className="text-center text-sm text-slate-muted">
        Need to act on this shipment?{" "}
        <Link href={`/app/shipments/${shipment.id}`} className="text-amber-brand hover:underline">
          Open in dashboard
        </Link>
      </p>
    </div>
  );
}
