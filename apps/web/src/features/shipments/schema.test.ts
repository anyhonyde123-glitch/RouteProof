import { describe, expect, it } from "vitest";
import {
  createShipmentSchema,
  handoffSchema,
  inspectionSchema,
  registerOrgSchema,
} from "@/features/shipments/schema";
import { ROLE } from "@/lib/constants";

const validAddress =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

describe("schemas", () => {
  it("validates create shipment input", () => {
    const result = createShipmentSchema.safeParse({
      sender: validAddress,
      carrier: validAddress,
      warehouse: validAddress,
      inspector: validAddress,
      receiver: validAddress,
      origin: "Port A",
      destination: "Port B",
      cargoHash: "hash12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid stellar addresses", () => {
    const result = createShipmentSchema.safeParse({
      sender: "invalid",
      carrier: validAddress,
      warehouse: validAddress,
      inspector: validAddress,
      receiver: validAddress,
      origin: "Port A",
      destination: "Port B",
      cargoHash: "hash12345678",
    });
    expect(result.success).toBe(false);
  });

  it("validates organization registration", () => {
    const result = registerOrgSchema.safeParse({
      account: validAddress,
      name: "Acme Logistics",
      roles: [ROLE.Sender, ROLE.Carrier],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one role", () => {
    const result = registerOrgSchema.safeParse({
      account: validAddress,
      name: "Acme Logistics",
      roles: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates handoff schema", () => {
    const result = handoffSchema.safeParse({
      fromParty: validAddress,
      toParty: validAddress,
      stage: 2,
      proofHash: "proof12345678",
    });
    expect(result.success).toBe(true);
  });

  it("validates inspection schema", () => {
    const result = inspectionSchema.safeParse({
      passed: true,
      notesHash: "notes12345678",
    });
    expect(result.success).toBe(true);
  });
});
