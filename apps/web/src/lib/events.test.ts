import { describe, expect, it } from "vitest";
import { SHIPMENT_STATUS } from "@/lib/constants";
import {
  buildShipmentTimeline,
  handoffToTimelineEvent,
  inspectionToTimelineEvent,
  settlementToTimelineEvent,
  summarizeTimeline,
} from "@/lib/events";
import type { HandoffRecord, InspectionRecord, SettlementRecord, Shipment } from "@/lib/types";

const shipment: Shipment = {
  id: 1,
  creator: "GC1",
  sender: "GC2",
  carrier: "GC3",
  warehouse: "GC4",
  inspector: "GC5",
  receiver: "GC6",
  origin: "NYC",
  destination: "LA",
  cargo_hash: "abc123",
  status: SHIPMENT_STATUS.InTransit,
  created_at: 1000,
  updated_at: 2000,
};

const handoff: HandoffRecord = {
  id: 1,
  shipment_id: 1,
  from_party: "GC2",
  to_party: "GC3",
  stage: 1,
  proof_hash: "proof1",
  actor: "GC3",
  recorded_at: 1500,
};

describe("events", () => {
  it("builds timeline from shipment artifacts", () => {
    const timeline = buildShipmentTimeline({
      shipment,
      handoffs: [handoff],
      inspection: null,
      settlement: null,
    });
    expect(timeline.length).toBeGreaterThanOrEqual(3);
    expect(timeline[0].title).toBe("Shipment created");
  });

  it("converts handoff records", () => {
    const event = handoffToTimelineEvent(handoff);
    expect(event.type).toBe("handoff");
    expect(event.title).toContain("Pickup");
  });

  it("converts inspection records", () => {
    const inspection: InspectionRecord = {
      id: 1,
      shipment_id: 1,
      inspector: "GC5",
      passed: true,
      notes_hash: "notes",
      submitted_at: 1800,
    };
    const event = inspectionToTimelineEvent(inspection);
    expect(event.title).toBe("Inspection passed");
  });

  it("converts settlement records", () => {
    const settlement: SettlementRecord = {
      shipment_id: 1,
      actor: "GC1",
      completed_at: 3000,
    };
    const event = settlementToTimelineEvent(settlement);
    expect(event.type).toBe("settlement");
  });

  it("summarizes latest timeline event", () => {
    const timeline = buildShipmentTimeline({
      shipment,
      handoffs: [handoff],
    });
    expect(summarizeTimeline(timeline)).toMatch(/^Latest:/);
    expect(summarizeTimeline([])).toBe("No on-chain events yet.");
  });
});
