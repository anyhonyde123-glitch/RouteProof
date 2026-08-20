import { describe, expect, it } from "vitest";
import {
  formatPercent,
  formatRelativeTime,
  formatRoles,
  formatStage,
  formatStatus,
  hashPreview,
  isValidStellarAddress,
  statusBadgeVariant,
  truncateAddress,
} from "@/lib/format";
import { SHIPMENT_STATUS } from "@/lib/constants";

const SAMPLE = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

describe("format", () => {
  it("truncates stellar addresses", () => {
    expect(truncateAddress(SAMPLE)).toBe("GAAAA…AWHF");
  });

  it("formats status labels", () => {
    expect(formatStatus(SHIPMENT_STATUS.Delivered)).toBe("Delivered");
    expect(formatStatus(99)).toBe("Unknown (99)");
  });

  it("formats handoff stages", () => {
    expect(formatStage(1)).toBe("Pickup");
    expect(formatStage(99)).toBe("Stage 99");
  });

  it("decodes role bitmasks", () => {
    expect(formatRoles(3)).toEqual(["Sender", "Carrier"]);
    expect(formatRoles(31)).toHaveLength(5);
  });

  it("validates stellar addresses", () => {
    expect(isValidStellarAddress("invalid")).toBe(false);
    expect(isValidStellarAddress("GABC")).toBe(false);
    expect(isValidStellarAddress(SAMPLE)).toBe(true);
  });

  it("returns relative time strings", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(now)).toBe("just now");
    expect(formatRelativeTime(now - 120)).toBe("2m ago");
  });

  it("formats percent values", () => {
    expect(formatPercent(42.567)).toBe("42.6%");
  });

  it("hashes preview safely", () => {
    expect(hashPreview("")).toBe("—");
    expect(hashPreview("abcdef123456", 6)).toBe("abcdef…");
  });

  it("maps status to badge variants", () => {
    expect(statusBadgeVariant(SHIPMENT_STATUS.Completed)).toBe("success");
    expect(statusBadgeVariant(SHIPMENT_STATUS.Created)).toBe("warning");
  });
});
