export const SHIPMENT_STATUS = {
  Created: 1,
  PickedUp: 2,
  InTransit: 3,
  WarehouseReceived: 4,
  InspectionPending: 5,
  Inspected: 6,
  OutForDelivery: 7,
  Delivered: 8,
  Completed: 9,
} as const;

export type ShipmentStatusValue =
  (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];

export const ROLE = {
  Sender: 1,
  Carrier: 2,
  Warehouse: 4,
  Inspector: 8,
  Receiver: 16,
} as const;

export type RoleFlag = (typeof ROLE)[keyof typeof ROLE];

export const HANDOFF_STAGE = {
  Pickup: 1,
  TransitToWarehouse: 2,
  ToInspector: 3,
  ToDelivery: 4,
  ToReceiver: 5,
} as const;

export type HandoffStageValue =
  (typeof HANDOFF_STAGE)[keyof typeof HANDOFF_STAGE];

export const STATUS_LABELS: Record<number, string> = {
  [SHIPMENT_STATUS.Created]: "Created",
  [SHIPMENT_STATUS.PickedUp]: "Picked Up",
  [SHIPMENT_STATUS.InTransit]: "In Transit",
  [SHIPMENT_STATUS.WarehouseReceived]: "Warehouse Received",
  [SHIPMENT_STATUS.InspectionPending]: "Inspection Pending",
  [SHIPMENT_STATUS.Inspected]: "Inspected",
  [SHIPMENT_STATUS.OutForDelivery]: "Out for Delivery",
  [SHIPMENT_STATUS.Delivered]: "Delivered",
  [SHIPMENT_STATUS.Completed]: "Completed",
};

export const STAGE_LABELS: Record<number, string> = {
  [HANDOFF_STAGE.Pickup]: "Pickup",
  [HANDOFF_STAGE.TransitToWarehouse]: "Transit to Warehouse",
  [HANDOFF_STAGE.ToInspector]: "To Inspector",
  [HANDOFF_STAGE.ToDelivery]: "To Delivery",
  [HANDOFF_STAGE.ToReceiver]: "To Receiver",
};

export const ROLE_LABELS: Record<number, string> = {
  [ROLE.Sender]: "Sender",
  [ROLE.Carrier]: "Carrier",
  [ROLE.Warehouse]: "Warehouse",
  [ROLE.Inspector]: "Inspector",
  [ROLE.Receiver]: "Receiver",
};

export const ACTIVE_STATUSES = new Set<number>([
  SHIPMENT_STATUS.Created,
  SHIPMENT_STATUS.PickedUp,
  SHIPMENT_STATUS.InTransit,
  SHIPMENT_STATUS.WarehouseReceived,
  SHIPMENT_STATUS.InspectionPending,
  SHIPMENT_STATUS.Inspected,
  SHIPMENT_STATUS.OutForDelivery,
  SHIPMENT_STATUS.Delivered,
]);

export const COMPLETED_STATUSES = new Set<number>([SHIPMENT_STATUS.Completed]);

export const NULL_ACCOUNT =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export interface ContractEnv {
  network: string;
  registryId: string;
  factoryId: string;
  shipmentId: string;
  handoffId: string;
  inspectionId: string;
  settlementId: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
}

export function getContractEnv(): ContractEnv | null {
  const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID?.trim();
  const factoryId = process.env.NEXT_PUBLIC_FACTORY_ID?.trim();
  const shipmentId = process.env.NEXT_PUBLIC_SHIPMENT_ID?.trim();
  const handoffId = process.env.NEXT_PUBLIC_HANDOFF_ID?.trim();
  const inspectionId = process.env.NEXT_PUBLIC_INSPECTION_ID?.trim();
  const settlementId = process.env.NEXT_PUBLIC_SETTLEMENT_ID?.trim();
  const horizonUrl = process.env.NEXT_PUBLIC_HORIZON_URL?.trim();
  const sorobanRpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL?.trim();

  if (
    !registryId ||
    !factoryId ||
    !shipmentId ||
    !handoffId ||
    !inspectionId ||
    !settlementId ||
    !horizonUrl ||
    !sorobanRpcUrl
  ) {
    return null;
  }

  return {
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet",
    registryId,
    factoryId,
    shipmentId,
    handoffId,
    inspectionId,
    settlementId,
    horizonUrl,
    sorobanRpcUrl,
  };
}

export function isContractsConfigured(): boolean {
  return getContractEnv() !== null;
}

export const CONFIG_ERROR_MESSAGE =
  "RouteProof contracts are not configured. Set all NEXT_PUBLIC_* contract IDs and RPC URLs in your environment.";
