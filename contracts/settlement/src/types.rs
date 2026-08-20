use soroban_sdk::{contracttype, Address, String};

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
pub struct SettlementConfig {
    pub admin: Address,
    pub shipment: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SettlementRecord {
    pub shipment_id: u64,
    pub actor: Address,
    pub completed_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Config,
    Settlement(u64),
}
