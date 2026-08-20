use soroban_sdk::{contractevent, Address, Env};

use crate::types::ShipmentStatus;

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ShipmentCreated {
    pub shipment_id: u64,
    pub creator: Address,
    pub sender: Address,
    pub carrier: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ShipmentStatusChanged {
    pub shipment_id: u64,
    pub old_status: ShipmentStatus,
    pub new_status: ShipmentStatus,
    pub actor: Address,
}

pub fn publish_shipment_created(
    env: &Env,
    shipment_id: u64,
    creator: &Address,
    sender: &Address,
    carrier: &Address,
) {
    ShipmentCreated {
        shipment_id,
        creator: creator.clone(),
        sender: sender.clone(),
        carrier: carrier.clone(),
    }
    .publish(env);
}

pub fn publish_status_changed(
    env: &Env,
    shipment_id: u64,
    old_status: ShipmentStatus,
    new_status: ShipmentStatus,
    actor: &Address,
) {
    ShipmentStatusChanged {
        shipment_id,
        old_status,
        new_status,
        actor: actor.clone(),
    }
    .publish(env);
}
