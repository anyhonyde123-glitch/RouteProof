"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ROLE } from "@/lib/constants";
import type { RoleFlag } from "@/lib/constants";
import { formatRoles, roleOptions } from "@/lib/format";
import { registerOrganization } from "@/lib/contracts";
import { registerOrgSchema } from "@/features/shipments/schema";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/useToast";
import { humanizeSorobanError } from "@/lib/errors";
import type { OrgProfile } from "@/lib/types";

export function RegisterOrgForm() {
  const { connect, signTransaction } = useWallet();
  const toast = useToast();
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleRole = (role: number) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = registerOrgSchema.safeParse({ account, name, roles });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const wallet = (await connect()) ?? "";
      if (!wallet) throw new Error("Connect Freighter to register.");
      await registerOrganization(
        { ...parsed.data, roles: parsed.data.roles as RoleFlag[] },
        wallet,
        signTransaction,
      );
      toast.success("Organization registered");
      setAccount("");
      setName("");
      setRoles([]);
    } catch (error) {
      toast.error("Registration failed", humanizeSorobanError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <Input
        label="Stellar account (G…)"
        value={account}
        onChange={(event) => setAccount(event.target.value)}
        error={errors.account}
      />
      <Input
        label="Organization name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-slate-200">Roles</p>
        <div className="flex flex-wrap gap-2">
          {roleOptions().map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleRole(option.value)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                roles.includes(option.value)
                  ? "border-amber-brand bg-amber-brand/15 text-amber-brand"
                  : "border-slate-700 text-slate-muted hover:border-slate-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.roles ? (
          <p className="mt-1 text-xs text-red-300">{errors.roles}</p>
        ) : null}
      </div>
      <Button type="submit" loading={loading}>
        Register organization
      </Button>
    </form>
  );
}

export function OrgProfileCard({ org }: { org: OrgProfile }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            {org.name}
          </h3>
          <p className="mt-1 text-sm text-slate-muted">{org.account}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={org.verified ? "success" : "warning"}>
            {org.verified ? "Verified" : "Unverified"}
          </Badge>
          <Badge variant={org.active ? "info" : "default"}>
            {org.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {formatRoles(org.roles).map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>
    </div>
  );
}

export { ROLE };
