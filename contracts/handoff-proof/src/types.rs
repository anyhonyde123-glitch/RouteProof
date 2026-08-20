use soroban_sdk::{contracttype, Address, String};

pub const STAGE_PICKUP: u32 = 1;
pub const STAGE_TRANSIT_TO_WAREHOUSE: u32 = 2;
pub const STAGE_TO_INSPECTOR: u32 = 3;
pub const STAGE_TO_DELIVERY: u32 = 4;
pub const STAGE_TO_RECEIVER: u32 = 5;

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ShipmentStatus {
    Created = 1,
    PickedUp = 2,
    InTransit = 3,
    WarehouseReceived = 4,
    InspectionPending = 5,
    Inspected = 6,
    OutForDelivery = 7,
    Delivered = 8,
    Completed = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Shipment {
    pub id: u64,
    pub creator: Address,
    pub sender: Address,
    pub carrier: Address,
    pub warehouse: Address,
    pub inspector: Address,
    pub receiver: Address,
    pub origin: String,
    pub destination: String,
    pub cargo_hash: String,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HandoffConfig {
    pub admin: Address,
    pub registry: Address,
    pub shipment: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HandoffRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub from_party: Address,
    pub to_party: Address,
    pub stage: u32,
    pub proof_hash: String,
    pub actor: Address,
    pub recorded_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Config,
    NextHandoffId,
    Handoff(u64),
    StageKey(u64, u32),
    ShipmentCount(u64),
    ShipmentIndex(u64, u32),
}
