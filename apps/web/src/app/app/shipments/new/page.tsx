import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import { CreateShipmentForm } from "@/features/shipments/CreateShipmentForm";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";

export default function NewShipmentPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/app/shipments" className="text-sm text-amber-brand hover:underline">
            ← Back to shipments
          </Link>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">
            Create shipment
          </h1>
          <p className="mt-2 text-slate-muted">
            Participants must be registered with the correct on-chain roles.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
          <CreateShipmentForm />
        </div>
      </div>
    </AppShell>
  );
}
