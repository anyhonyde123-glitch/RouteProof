import { AppShell } from "@/components/layout/AppShell";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import { OrgLookup } from "@/features/organizations/OrgLookup";
import { RegisterOrgForm } from "@/features/organizations/OrganizationPanel";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";

export default function OrganizationsPage() {
  if (!isContractsConfigured()) {
    return (
      <AppShell>
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Organizations
          </h1>
          <p className="mt-2 text-slate-muted">
            Register participants with on-chain roles before creating shipments.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Register organization
            </h2>
            <p className="mt-1 text-sm text-slate-muted">
              Requires Freighter signature. Assign sender, carrier, warehouse,
              inspector, and/or receiver roles.
            </p>
            <div className="mt-6">
              <RegisterOrgForm />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Lookup organization
            </h2>
            <p className="mt-1 text-sm text-slate-muted">
              Query the on-chain registry by Stellar account address.
            </p>
            <div className="mt-6">
              <OrgLookup />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
