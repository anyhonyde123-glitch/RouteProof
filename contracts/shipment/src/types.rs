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

impl ShipmentStatus {
    pub fn from_u32(value: u32) -> Option<Self> {
        match value {
            1 => Some(Self::Created),
            2 => Some(Self::PickedUp),
            3 => Some(Self::InTransit),
            4 => Some(Self::WarehouseReceived),
            5 => Some(Self::InspectionPending),
            6 => Some(Self::Inspected),
            7 => Some(Self::OutForDelivery),
            8 => Some(Self::Delivered),
            9 => Some(Self::Completed),
            _ => None,
        }
    }

    pub fn is_valid_transition(from: Self, to: Self) -> bool {
        matches!(
            (from, to),
            (Self::Created, Self::PickedUp)
                | (Self::PickedUp, Self::InTransit)
                | (Self::InTransit, Self::WarehouseReceived)
                | (Self::WarehouseReceived, Self::InspectionPending)
                | (Self::InspectionPending, Self::Inspected)
                | (Self::InspectionPending, Self::WarehouseReceived)
                | (Self::Inspected, Self::OutForDelivery)
                | (Self::OutForDelivery, Self::Delivered)
                | (Self::Delivered, Self::Completed)
        )
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ShipmentConfig {
    pub admin: Address,
    pub registry: Address,
    pub factory: Address,
    pub handoff: Address,
    pub inspection: Address,
    pub settlement: Address,
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
#[derive(Clone)]
pub enum DataKey {
    Config,
    NextShipmentId,
    Shipment(u64),
}
