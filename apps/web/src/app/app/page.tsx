import { LiveRefresh } from "@/components/LiveRefresh";
import { AppShell } from "@/components/layout/AppShell";
import { ConfigErrorState, EmptyState } from "@/components/ui/EmptyState";
import { ShipmentCard } from "@/features/shipments/ShipmentList";
import { StatsGrid } from "@/features/analytics/MetricsPanels";
import { ACTIVE_STATUSES, COMPLETED_STATUSES, CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import { getDashboardStats, listShipments } from "@/lib/contracts";

export default async function DashboardPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  try {
    const [stats, shipments] = await Promise.all([
      getDashboardStats(),
      listShipments(12),
    ]);

    const active = shipments.filter((s) => ACTIVE_STATUSES.has(s.status));
    const completed = shipments.filter((s) => COMPLETED_STATUSES.has(s.status));

    return (
      <AppShell>
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-slate-muted">
                Live metrics from on-chain shipment and handoff contracts.
              </p>
            </div>
            <LiveRefresh label="Dashboard" />
          </div>
          <StatsGrid stats={stats} />
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-white">
              Active shipments
            </h2>
            {active.length === 0 ? (
              <EmptyState
                title="No active shipments"
                description="Create a shipment once organizations are registered on chain."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {active.slice(0, 4).map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-white">
              Recently completed
            </h2>
            {completed.length === 0 ? (
              <EmptyState
                title="No completed shipments yet"
                description="Completed shipments appear here after settlement."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {completed.slice(0, 2).map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    );
  } catch {
    return (
      <AppShell>
        <ConfigErrorState message="Unable to load dashboard data from Soroban. Check RPC connectivity and contract IDs." />
      </AppShell>
    );
  }
}
