import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ConfigErrorState, EmptyState } from "@/components/ui/EmptyState";
import { ShipmentTable } from "@/features/shipments/ShipmentList";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import { listShipments } from "@/lib/contracts";

export default async function ShipmentsPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  let shipments;
  try {
    shipments = await listShipments(100);
  } catch {
    return (
      <AppShell>
        <ConfigErrorState message="Unable to load shipments from Soroban. Check RPC connectivity and contract IDs." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Shipments
            </h1>
            <p className="mt-2 text-slate-muted">
              All shipments indexed from the on-chain factory.
            </p>
          </div>
          <Link href="/app/shipments/new">
            <Button>Create shipment</Button>
          </Link>
        </div>
        {shipments.length === 0 ? (
          <EmptyState
            title="No shipments on chain"
            description="Register organizations, connect a wallet, and create your first shipment."
            actionLabel="Create shipment"
            actionHref="/app/shipments/new"
          />
        ) : (
          <ShipmentTable shipments={shipments} />
        )}
      </div>
    </AppShell>
  );
}
