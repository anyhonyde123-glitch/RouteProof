import { SHIPMENT_STATUS } from "./constants";
import { formatStage, formatStatus, formatTimestamp } from "./format";
import type {
  HandoffRecord,
  InspectionRecord,
  SettlementRecord,
  Shipment,
  TimelineEvent,
} from "./types";

function shipmentCreatedEvent(shipment: Shipment): TimelineEvent {
  return {
    id: `status-created-${shipment.id}`,
    type: "status",
    timestamp: shipment.created_at,
    title: "Shipment created",
    description: `${shipment.origin} → ${shipment.destination}`,
    actor: shipment.creator,
    metadata: { status: SHIPMENT_STATUS.Created },
  };
}

function shipmentUpdatedEvent(shipment: Shipment): TimelineEvent | null {
  if (shipment.updated_at <= shipment.created_at) return null;
  return {
    id: `status-${shipment.id}-${shipment.status}-${shipment.updated_at}`,
    type: "status",
    timestamp: shipment.updated_at,
    title: `Status: ${formatStatus(shipment.status)}`,
    description: "Shipment status updated on chain",
    metadata: { status: shipment.status },
  };
}

export function handoffToTimelineEvent(record: HandoffRecord): TimelineEvent {
  return {
    id: `handoff-${record.id}`,
    type: "handoff",
    timestamp: record.recorded_at,
    title: `Handoff: ${formatStage(record.stage)}`,
    description: `Proof ${record.proof_hash}`,
    actor: record.actor,
    metadata: {
      stage: record.stage,
      from: record.from_party,
      to: record.to_party,
    },
  };
}

export function inspectionToTimelineEvent(
  record: InspectionRecord,
): TimelineEvent {
  return {
    id: `inspection-${record.id}`,
    type: "inspection",
    timestamp: record.submitted_at,
    title: record.passed ? "Inspection passed" : "Inspection failed",
    description: record.passed
      ? "Cargo approved for delivery"
      : `Notes hash: ${record.notes_hash}`,
    actor: record.inspector,
    metadata: { passed: record.passed },
  };
}

export function settlementToTimelineEvent(
  record: SettlementRecord,
): TimelineEvent {
  return {
    id: `settlement-${record.shipment_id}`,
    type: "settlement",
    timestamp: record.completed_at,
    title: "Settlement completed",
    description: "Shipment marked completed on chain",
    actor: record.actor,
  };
}

export function buildShipmentTimeline(input: {
  shipment: Shipment;
  handoffs: HandoffRecord[];
  inspection?: InspectionRecord | null;
  settlement?: SettlementRecord | null;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [shipmentCreatedEvent(input.shipment)];

  for (const handoff of input.handoffs) {
    events.push(handoffToTimelineEvent(handoff));
  }

  if (input.inspection) {
    events.push(inspectionToTimelineEvent(input.inspection));
  }

  const updated = shipmentUpdatedEvent(input.shipment);
  if (updated) events.push(updated);

  if (input.settlement) {
    events.push(settlementToTimelineEvent(input.settlement));
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export function summarizeTimeline(events: TimelineEvent[]): string {
  if (events.length === 0) return "No on-chain events yet.";
  const latest = events[events.length - 1];
  return `Latest: ${latest.title} at ${formatTimestamp(latest.timestamp)}`;
}

export function parseEventTopics(
  topics: string[],
  data: Record<string, unknown>,
): TimelineEvent | null {
  const eventName = topics[0]?.toLowerCase();
  if (!eventName) return null;

  if (eventName.includes("handoff")) {
    return {
      id: `topic-handoff-${String(data.id ?? Date.now())}`,
      type: "handoff",
      timestamp: Number(data.recorded_at ?? data.timestamp ?? 0),
      title: "Handoff recorded",
      description: String(data.proof_hash ?? "On-chain handoff event"),
      actor: String(data.actor ?? ""),
    };
  }

  if (eventName.includes("inspection")) {
    return {
      id: `topic-inspection-${String(data.id ?? Date.now())}`,
      type: "inspection",
      timestamp: Number(data.submitted_at ?? data.timestamp ?? 0),
      title: data.passed ? "Inspection passed" : "Inspection submitted",
      description: "On-chain inspection event",
      actor: String(data.inspector ?? ""),
      metadata: { passed: Boolean(data.passed) },
    };
  }

  if (eventName.includes("status")) {
    return {
      id: `topic-status-${String(data.shipment_id ?? Date.now())}`,
      type: "status",
      timestamp: Number(data.timestamp ?? 0),
      title: "Status changed",
      description: formatStatus(Number(data.new_status ?? 0)),
    };
  }

  return null;
}
