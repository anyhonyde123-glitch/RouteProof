import { formatPercent } from "@/lib/format";
import type { AnalyticsMetrics, DashboardStats } from "@/lib/types";

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Total shipments", value: stats.total },
    { label: "Active", value: stats.active },
    { label: "Completed", value: stats.completed },
    { label: "Pending inspections", value: stats.pendingInspections },
    { label: "Recorded handoffs", value: stats.recentHandoffs },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-5"
        >
          <p className="text-sm text-slate-muted">{item.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPanel({ metrics }: { metrics: AnalyticsMetrics }) {
  const items = [
    { label: "Total shipments", value: metrics.totalShipments },
    { label: "Completed", value: metrics.completedShipments },
    { label: "In transit", value: metrics.inTransit },
    { label: "Pending inspections", value: metrics.pendingInspections },
    { label: "Failed inspections", value: metrics.failedInspections },
    {
      label: "Avg handoffs / shipment",
      value: metrics.averageHandoffs.toFixed(1),
    },
    {
      label: "Completion rate",
      value: formatPercent(metrics.completionRate),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-5"
        >
          <p className="text-sm text-slate-muted">{item.label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-amber-brand">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
