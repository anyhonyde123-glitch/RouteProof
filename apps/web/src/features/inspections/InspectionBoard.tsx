import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, formatStatus, statusBadgeVariant, truncateAddress } from "@/lib/format";
import type { Shipment } from "@/lib/types";

export function InspectionBoard({ shipments }: { shipments: Shipment[] }) {
  if (shipments.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shipments.map((shipment) => (
        <Link
          key={shipment.id}
          href={`/app/shipments/${shipment.id}`}
          className="rounded-2xl border border-amber-brand/20 bg-amber-brand/5 p-5 transition hover:border-amber-brand/40"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-display font-semibold text-white">
              Shipment #{shipment.id}
            </p>
            <Badge variant={statusBadgeVariant(shipment.status)}>
              {formatStatus(shipment.status)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-muted">
            Inspector {truncateAddress(shipment.inspector)}
          </p>
          <p className="mt-1 text-xs text-slate-muted">
            Waiting since {formatRelativeTime(shipment.updated_at)}
          </p>
        </Link>
      ))}
    </div>
  );
}
