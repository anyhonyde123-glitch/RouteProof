import type { HandoffStageValue, RoleFlag, ShipmentStatusValue } from "./constants";

export interface Shipment {
  id: number;
  creator: string;
  sender: string;
  carrier: string;
  warehouse: string;
  inspector: string;
  receiver: string;
  origin: string;
  destination: string;
  cargo_hash: string;
  status: ShipmentStatusValue;
  created_at: number;
  updated_at: number;
}

export interface HandoffRecord {
  id: number;
  shipment_id: number;
  from_party: string;
  to_party: string;
  stage: HandoffStageValue;
  proof_hash: string;
  actor: string;
  recorded_at: number;
}

export interface InspectionRecord {
  id: number;
  shipment_id: number;
  inspector: string;
  passed: boolean;
  notes_hash: string;
  submitted_at: number;
}

export interface SettlementRecord {
  shipment_id: number;
  actor: string;
  completed_at: number;
}

export interface OrgProfile {
  account: string;
  name: string;
  roles: number;
  verified: boolean;
  active: boolean;
}

export type TimelineEventType =
  | "status"
  | "handoff"
  | "inspection"
  | "settlement";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  title: string;
  description: string;
  actor?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  pendingInspections: number;
  recentHandoffs: number;
}

export interface AnalyticsMetrics {
  totalShipments: number;
  completedShipments: number;
  inTransit: number;
  pendingInspections: number;
  failedInspections: number;
  averageHandoffs: number;
  completionRate: number;
}

export type WalletStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface WalletState {
  status: WalletStatus;
  publicKey: string | null;
  error: string | null;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error" | "info";
}

export interface CreateShipmentInput {
  sender: string;
  carrier: string;
  warehouse: string;
  inspector: string;
  receiver: string;
  origin: string;
  destination: string;
  cargoHash: string;
}

export interface RecordHandoffInput {
  shipmentId: number;
  fromParty: string;
  toParty: string;
  stage: HandoffStageValue;
  proofHash: string;
}

export interface SubmitInspectionInput {
  shipmentId: number;
  passed: boolean;
  notesHash: string;
}

export interface RegisterOrgInput {
  account: string;
  name: string;
  roles: RoleFlag[];
}
