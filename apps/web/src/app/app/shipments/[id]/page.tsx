import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import {
  CustodyTimeline,
  ShipmentActionsPanel,
} from "@/features/shipments/ShipmentDetail";
import { TimelineView } from "@/features/timeline/TimelineView";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import {
  getHandoffsForShipment,
  getLatestInspection,
  getSettlement,
  getShipment,
} from "@/lib/contracts";
import { buildShipmentTimeline } from "@/lib/events";
import {
  formatStatus,
  formatTimestamp,
  hashPreview,
  statusBadgeVariant,
  truncateAddress,
} from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  const shipment = await getShipment(id);
  if (!shipment) {
    notFound();
  }

  const [handoffs, inspection, settlement] = await Promise.all([
    getHandoffsForShipment(id),
    getLatestInspection(id),
    getSettlement(id),
  ]);

  const timeline = buildShipmentTimeline({
    shipment,
    handoffs,
    inspection,
    settlement,
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <Link
            href="/app/shipments"
            className="text-sm text-amber-brand hover:underline"
          >
            ← Back to shipments
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Shipment #{shipment.id}
              </h1>
              <p className="mt-2 text-slate-muted">
                {shipment.origin} → {shipment.destination}
              </p>
            </div>
            <Badge variant={statusBadgeVariant(shipment.status)}>
              {formatStatus(shipment.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
              <h2 className="font-display text-lg font-semibold text-white">
                Shipment details
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {(
                  [
                    ["Creator", shipment.creator],
                    ["Sender", shipment.sender],
                    ["Carrier", shipment.carrier],
                    ["Warehouse", shipment.warehouse],
                    ["Inspector", shipment.inspector],
                    ["Receiver", shipment.receiver],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-muted">{label}</dt>
                    <dd className="mt-0.5 font-mono text-slate-200">
                      {truncateAddress(value, 6)}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-slate-muted">Cargo hash</dt>
                  <dd className="mt-0.5 text-slate-200">
                    {hashPreview(shipment.cargo_hash, 20)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-muted">Created</dt>
                  <dd className="mt-0.5 text-slate-200">
                    {formatTimestamp(shipment.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-muted">Last updated</dt>
                  <dd className="mt-0.5 text-slate-200">
                    {formatTimestamp(shipment.updated_at)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
              <h2 className="font-display text-lg font-semibold text-white">
                Custody timeline
              </h2>
              <div className="mt-4">
                <TimelineView events={timeline} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6 lg:hidden">
              <h2 className="font-display text-lg font-semibold text-white">
                Handoff chain
              </h2>
              <div className="mt-4">
                <CustodyTimeline shipment={shipment} handoffs={handoffs} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <ShipmentActionsPanel shipment={shipment} />
            <section className="hidden rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6 lg:block">
              <h2 className="font-display text-lg font-semibold text-white">
                Handoff chain
              </h2>
              <div className="mt-4">
                <CustodyTimeline shipment={shipment} handoffs={handoffs} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
