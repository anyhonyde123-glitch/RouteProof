"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonText } from "@/components/ui/Skeleton";
import { getOrg } from "@/lib/contracts";
import { humanizeSorobanError } from "@/lib/errors";
import { isValidStellarAddress } from "@/lib/format";
import type { OrgProfile } from "@/lib/types";
import { OrgProfileCard } from "./OrganizationPanel";

export function OrgLookup() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidStellarAddress(account)) {
      setError("Enter a valid Stellar address (G…)");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const result = await getOrg(account);
      setOrg(result);
      if (!result) {
        setError("No organization registered for this account.");
      }
    } catch (err) {
      setError(humanizeSorobanError(err));
      setOrg(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => void handleSearch(event)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <Input
          label="Lookup by account"
          value={account}
          onChange={(event) => {
            setAccount(event.target.value);
            setError("");
          }}
          placeholder="G..."
          error={error && !org ? error : undefined}
        />
        <Button type="submit" loading={loading}>
          <Search className="h-4 w-4" />
          Lookup
        </Button>
      </form>
      {loading ? <SkeletonText lines={4} /> : null}
      {!loading && org ? <OrgProfileCard org={org} /> : null}
      {!loading && searched && !org && !error ? (
        <p className="text-sm text-slate-muted">Organization not found.</p>
      ) : null}
    </div>
  );
}
