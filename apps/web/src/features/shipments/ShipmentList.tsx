"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  formatRelativeTime,
  formatStatus,
  statusBadgeVariant,
  truncateAddress,
} from "@/lib/format";
import type { Shipment } from "@/lib/types";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      href={`/app/shipments/${shipment.id}`}
      className="group block rounded-2xl border border-slate-700/50 bg-navy-900/60 p-5 transition hover:border-amber-brand/30 hover:bg-navy-800/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand/10">
            <Package className="h-5 w-5 text-amber-brand" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-white">
              Shipment #{shipment.id}
            </p>
            <p className="text-sm text-slate-muted">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
        </div>
        <Badge variant={statusBadgeVariant(shipment.status)}>
          {formatStatus(shipment.status)}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-muted">
        <span>Carrier {truncateAddress(shipment.carrier)}</span>
        <span className="inline-flex items-center gap-1 group-hover:text-amber-brand">
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-muted">
        Updated {formatRelativeTime(shipment.updated_at)}
      </p>
    </Link>
  );
}

export function ShipmentTable({ shipments }: { shipments: Shipment[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50">
      <table className="min-w-full divide-y divide-slate-700/50 text-sm">
        <thead className="bg-navy-900/80">
          <tr>
            {["ID", "Route", "Status", "Carrier", "Updated"].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-muted"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30 bg-navy-950/40">
          {shipments.map((shipment) => (
            <tr key={shipment.id} className="hover:bg-navy-800/40">
              <td className="px-4 py-3">
                <Link
                  href={`/app/shipments/${shipment.id}`}
                  className="font-medium text-amber-brand hover:underline"
                >
                  #{shipment.id}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-200">
                {shipment.origin} → {shipment.destination}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusBadgeVariant(shipment.status)}>
                  {formatStatus(shipment.status)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-muted">
                {truncateAddress(shipment.carrier)}
              </td>
              <td className="px-4 py-3 text-slate-muted">
                {formatRelativeTime(shipment.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
