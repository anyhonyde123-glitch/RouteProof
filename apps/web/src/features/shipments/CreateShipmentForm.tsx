"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createShipmentSchema } from "./schema";
import { useShipmentActions } from "@/hooks/useShipmentActions";
import { humanizeSorobanError } from "@/lib/errors";

const defaultValues = {
  sender: "",
  carrier: "",
  warehouse: "",
  inspector: "",
  receiver: "",
  origin: "",
  destination: "",
  cargoHash: "",
};

export function CreateShipmentForm() {
  const router = useRouter();
  const { create, loading } = useShipmentActions();
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof defaultValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = createShipmentSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      const id = await create(parsed.data);
      router.push(`/app/shipments/${id}`);
    } catch (error) {
      setErrors({ form: humanizeSorobanError(error) });
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["sender", "Sender (G…)"],
            ["carrier", "Carrier (G…)"],
            ["warehouse", "Warehouse (G…)"],
            ["inspector", "Inspector (G…)"],
            ["receiver", "Receiver (G…)"],
          ] as const
        ).map(([field, label]) => (
          <Input
            key={field}
            label={label}
            name={field}
            value={values[field]}
            onChange={(event) => handleChange(field, event.target.value)}
            error={errors[field]}
            placeholder="G..."
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Origin"
          name="origin"
          value={values.origin}
          onChange={(event) => handleChange("origin", event.target.value)}
          error={errors.origin}
        />
        <Input
          label="Destination"
          name="destination"
          value={values.destination}
          onChange={(event) => handleChange("destination", event.target.value)}
          error={errors.destination}
        />
      </div>
      <Input
        label="Cargo hash"
        name="cargoHash"
        value={values.cargoHash}
        onChange={(event) => handleChange("cargoHash", event.target.value)}
        error={errors.cargoHash}
        hint="SHA-256 or content fingerprint recorded on chain"
      />
      {errors.form ? (
        <p className="text-sm text-red-300">{errors.form}</p>
      ) : null}
      <Button type="submit" loading={loading}>
        Create shipment on chain
      </Button>
    </form>
  );
}
