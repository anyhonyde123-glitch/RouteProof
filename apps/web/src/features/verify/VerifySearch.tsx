"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function VerifySearch() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(id.trim());
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError("Enter a valid shipment ID (positive integer)");
      return;
    }
    setError("");
    router.push(`/verify/${parsed}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-end"
    >
      <Input
        label="Shipment ID"
        name="shipmentId"
        value={id}
        onChange={(event) => {
          setId(event.target.value);
          setError("");
        }}
        error={error}
        placeholder="e.g. 1"
        hint="Public read-only verification from Soroban contracts"
      />
      <Button type="submit" size="lg" className="sm:mb-0.5">
        <Search className="h-4 w-4" />
        Verify
      </Button>
    </form>
  );
}
