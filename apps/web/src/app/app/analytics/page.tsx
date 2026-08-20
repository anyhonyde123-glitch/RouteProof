import { AppShell } from "@/components/layout/AppShell";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import { AnalyticsPanel } from "@/features/analytics/MetricsPanels";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import { getAnalyticsMetrics } from "@/lib/contracts";

export default async function AnalyticsPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  let metrics;
  try {
    metrics = await getAnalyticsMetrics();
  } catch {
    return (
      <AppShell>
        <ConfigErrorState message="Unable to load analytics from Soroban. Check RPC connectivity." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Analytics
          </h1>
          <p className="mt-2 text-slate-muted">
            On-chain metrics aggregated from shipment, handoff, and inspection
            contracts.
          </p>
        </div>
        <AnalyticsPanel metrics={metrics} />
      </div>
    </AppShell>
  );
}
