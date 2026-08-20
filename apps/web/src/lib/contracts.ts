import { ACTIVE_STATUSES, COMPLETED_STATUSES, SHIPMENT_STATUS } from "./constants";
import { ConfigurationError } from "./errors";
import { invokeContract, requireContractEnv, simulateContract } from "./stellar";
import type {
  AnalyticsMetrics,
  CreateShipmentInput,
  DashboardStats,
  HandoffRecord,
  InspectionRecord,
  OrgProfile,
  RecordHandoffInput,
  RegisterOrgInput,
  SettlementRecord,
  Shipment,
  SubmitInspectionInput,
} from "./types";

function normalizeShipment(raw: Record<string, unknown>): Shipment {
  return {
    id: Number(raw.id),
    creator: String(raw.creator),
    sender: String(raw.sender),
    carrier: String(raw.carrier),
    warehouse: String(raw.warehouse),
    inspector: String(raw.inspector),
    receiver: String(raw.receiver),
    origin: String(raw.origin),
    destination: String(raw.destination),
    cargo_hash: String(raw.cargo_hash),
    status: Number(raw.status) as Shipment["status"],
    created_at: Number(raw.created_at),
    updated_at: Number(raw.updated_at),
  };
}

function normalizeHandoff(raw: Record<string, unknown>): HandoffRecord {
  return {
    id: Number(raw.id),
    shipment_id: Number(raw.shipment_id),
    from_party: String(raw.from_party),
    to_party: String(raw.to_party),
    stage: Number(raw.stage) as HandoffRecord["stage"],
    proof_hash: String(raw.proof_hash),
    actor: String(raw.actor),
    recorded_at: Number(raw.recorded_at),
  };
}

function normalizeInspection(raw: Record<string, unknown>): InspectionRecord {
  return {
    id: Number(raw.id),
    shipment_id: Number(raw.shipment_id),
    inspector: String(raw.inspector),
    passed: Boolean(raw.passed),
    notes_hash: String(raw.notes_hash),
    submitted_at: Number(raw.submitted_at),
  };
}

function normalizeSettlement(raw: Record<string, unknown>): SettlementRecord {
  return {
    shipment_id: Number(raw.shipment_id),
    actor: String(raw.actor),
    completed_at: Number(raw.completed_at),
  };
}

function normalizeOrg(raw: Record<string, unknown>): OrgProfile {
  return {
    account: String(raw.account),
    name: String(raw.name),
    roles: Number(raw.roles),
    verified: Boolean(raw.verified),
    active: Boolean(raw.active),
  };
}

export async function getNextShipmentId(): Promise<number> {
  const env = requireContractEnv();
  return Number(
    await simulateContract<number>(env.shipmentId, "next_shipment_id"),
  );
}

export async function getShipment(id: number): Promise<Shipment | null> {
  const env = requireContractEnv();
  try {
    const raw = await simulateContract<Record<string, unknown>>(
      env.shipmentId,
      "get_shipment",
      [id],
    );
    return normalizeShipment(raw);
  } catch {
    return null;
  }
}

export async function listShipments(limit = 50): Promise<Shipment[]> {
  const nextId = await getNextShipmentId();
  const shipments: Shipment[] = [];

  for (let id = 1; id < nextId && shipments.length < limit; id += 1) {
    const shipment = await getShipment(id);
    if (shipment) shipments.push(shipment);
  }

  return shipments.sort((a, b) => b.updated_at - a.updated_at);
}

export async function getHandoffsForShipment(
  shipmentId: number,
): Promise<HandoffRecord[]> {
  const env = requireContractEnv();
  const count = Number(
    await simulateContract<number>(
      env.handoffId,
      "handoffs_for_shipment_count",
      [shipmentId],
    ),
  );

  const handoffs: HandoffRecord[] = [];
  for (let index = 0; index < count; index += 1) {
    const raw = await simulateContract<Record<string, unknown>>(
      env.handoffId,
      "handoffs_for_shipment",
      [shipmentId, index],
    );
    handoffs.push(normalizeHandoff(raw));
  }

  return handoffs.sort((a, b) => a.recorded_at - b.recorded_at);
}

export async function getLatestInspection(
  shipmentId: number,
): Promise<InspectionRecord | null> {
  const env = requireContractEnv();
  try {
    const raw = await simulateContract<Record<string, unknown>>(
      env.inspectionId,
      "get_latest_for_shipment",
      [shipmentId],
    );
    return normalizeInspection(raw);
  } catch {
    return null;
  }
}

export async function getSettlement(
  shipmentId: number,
): Promise<SettlementRecord | null> {
  const env = requireContractEnv();
  try {
    const raw = await simulateContract<Record<string, unknown> | null>(
      env.settlementId,
      "get_settlement",
      [shipmentId],
    );
    if (!raw) return null;
    return normalizeSettlement(raw);
  } catch {
    return null;
  }
}

export async function getOrg(account: string): Promise<OrgProfile | null> {
  const env = requireContractEnv();
  try {
    const raw = await simulateContract<Record<string, unknown> | null>(
      env.registryId,
      "get_org",
      [account],
    );
    if (!raw) return null;
    return normalizeOrg(raw);
  } catch {
    return null;
  }
}

export async function hasRole(account: string, role: number): Promise<boolean> {
  const env = requireContractEnv();
  return Boolean(
    await simulateContract<boolean>(env.registryId, "has_role", [account, role]),
  );
}

export async function isParticipant(
  shipmentId: number,
  account: string,
): Promise<boolean> {
  const env = requireContractEnv();
  return Boolean(
    await simulateContract<boolean>(env.shipmentId, "is_participant", [
      shipmentId,
      account,
    ]),
  );
}

export async function createShipment(
  input: CreateShipmentInput,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<number> {
  const env = requireContractEnv();
  const id = await invokeContract(
    env.factoryId,
    "create",
    [
      publicKey,
      input.sender,
      input.carrier,
      input.warehouse,
      input.inspector,
      input.receiver,
      input.origin,
      input.destination,
      input.cargoHash,
    ],
    publicKey,
    signTransaction,
  );
  return Number(id);
}

export async function markInTransit(
  shipmentId: number,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<void> {
  const env = requireContractEnv();
  await invokeContract(
    env.shipmentId,
    "mark_in_transit",
    [publicKey, shipmentId],
    publicKey,
    signTransaction,
  );
}

export async function recordHandoff(
  input: RecordHandoffInput,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<number> {
  const env = requireContractEnv();
  const id = await invokeContract(
    env.handoffId,
    "record_handoff",
    [
      publicKey,
      input.shipmentId,
      input.fromParty,
      input.toParty,
      input.stage,
      input.proofHash,
    ],
    publicKey,
    signTransaction,
  );
  return Number(id);
}

export async function submitInspection(
  input: SubmitInspectionInput,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<number> {
  const env = requireContractEnv();
  const id = await invokeContract(
    env.inspectionId,
    "submit",
    [publicKey, input.shipmentId, input.passed, input.notesHash],
    publicKey,
    signTransaction,
  );
  return Number(id);
}

export async function settleShipment(
  shipmentId: number,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<void> {
  const env = requireContractEnv();
  await invokeContract(
    env.settlementId,
    "complete",
    [publicKey, shipmentId],
    publicKey,
    signTransaction,
  );
}

export async function registerOrganization(
  input: RegisterOrgInput,
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<void> {
  const env = requireContractEnv();
  const roles = input.roles.reduce((acc, role) => acc | role, 0);
  await invokeContract(
    env.registryId,
    "register",
    [input.account, input.name, roles],
    publicKey,
    signTransaction,
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const shipments = await listShipments(100);
  const active = shipments.filter((s) => ACTIVE_STATUSES.has(s.status)).length;
  const completed = shipments.filter((s) =>
    COMPLETED_STATUSES.has(s.status),
  ).length;
  const pendingInspections = shipments.filter(
    (s) => s.status === SHIPMENT_STATUS.InspectionPending,
  ).length;

  let recentHandoffs = 0;
  const env = requireContractEnv();
  for (const shipment of shipments.slice(0, 10)) {
    const count = Number(
      await simulateContract<number>(
        env.handoffId,
        "handoffs_for_shipment_count",
        [shipment.id],
      ),
    );
    recentHandoffs += count;
  }

  return {
    total: shipments.length,
    active,
    completed,
    pendingInspections,
    recentHandoffs,
  };
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const shipments = await listShipments(200);
  const completed = shipments.filter((s) =>
    COMPLETED_STATUSES.has(s.status),
  ).length;
  const inTransit = shipments.filter(
    (s) => s.status === SHIPMENT_STATUS.InTransit,
  ).length;
  const pendingInspections = shipments.filter(
    (s) => s.status === SHIPMENT_STATUS.InspectionPending,
  ).length;

  let failedInspections = 0;
  let handoffTotal = 0;
  const env = requireContractEnv();

  for (const shipment of shipments) {
    const inspection = await getLatestInspection(shipment.id);
    if (inspection && !inspection.passed) failedInspections += 1;

    const count = Number(
      await simulateContract<number>(
        env.handoffId,
        "handoffs_for_shipment_count",
        [shipment.id],
      ),
    );
    handoffTotal += count;
  }

  const totalShipments = shipments.length;
  const averageHandoffs =
    totalShipments > 0 ? handoffTotal / totalShipments : 0;
  const completionRate =
    totalShipments > 0 ? (completed / totalShipments) * 100 : 0;

  return {
    totalShipments,
    completedShipments: completed,
    inTransit,
    pendingInspections,
    failedInspections,
    averageHandoffs,
    completionRate,
  };
}

export async function getPendingInspectionShipments(): Promise<Shipment[]> {
  const shipments = await listShipments(100);
  return shipments.filter(
    (s) => s.status === SHIPMENT_STATUS.InspectionPending,
  );
}

export function assertConfigured(): void {
  requireContractEnv();
}

export { ConfigurationError };
