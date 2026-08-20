import { AppShell } from "@/components/layout/AppShell";
import { ConfigErrorState, EmptyState } from "@/components/ui/EmptyState";
import { InspectionBoard } from "@/features/inspections/InspectionBoard";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import { getPendingInspectionShipments } from "@/lib/contracts";

export default async function InspectionsPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  let shipments;
  try {
    shipments = await getPendingInspectionShipments();
  } catch {
    return (
      <AppShell>
        <ConfigErrorState message="Unable to load inspections from Soroban. Check RPC connectivity." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Inspections
          </h1>
          <p className="mt-2 text-slate-muted">
            Shipments awaiting inspector sign-off on chain.
          </p>
        </div>
        {shipments.length === 0 ? (
          <EmptyState
            title="No pending inspections"
            description="Shipments appear here when they reach Inspection Pending status."
          />
        ) : (
          <InspectionBoard shipments={shipments} />
        )}
      </div>
    </AppShell>
  );
}
