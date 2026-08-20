import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  humanizeSorobanError,
  SorobanContractError,
  wrapSorobanError,
} from "@/lib/errors";

describe("errors", () => {
  it("humanizes configuration errors", () => {
    const error = new ConfigurationError("Missing contract IDs");
    expect(humanizeSorobanError(error)).toBe("Missing contract IDs");
  });

  it("maps contract-specific error codes", () => {
    const error = new SorobanContractError("raw", 3, "shipment");
    expect(humanizeSorobanError(error)).toBe(
      "You are not authorized to perform this action.",
    );
  });

  it("matches message patterns", () => {
    expect(humanizeSorobanError(new Error("duplicate handoff detected"))).toBe(
      "A handoff for this stage was already recorded.",
    );
    expect(humanizeSorobanError(new Error("invalid status transition"))).toBe(
      "Shipment status does not allow this action.",
    );
  });

  it("wraps errors with contract source", () => {
    const wrapped = wrapSorobanError(
      new Error("Error(Contract, #5)"),
      "handoff",
    );
    expect(wrapped).toBeInstanceOf(SorobanContractError);
    expect(wrapped.message).toBe(
      "Handoff parties do not match the shipment route.",
    );
    expect(wrapped.code).toBe(5);
    expect(wrapped.source).toBe("handoff");
  });

  it("truncates very long raw errors", () => {
    const long = "x".repeat(200);
    expect(humanizeSorobanError(new Error(long))).toBe(
      "The on-chain operation failed. Verify wallet, roles, and shipment state.",
    );
  });
});
