use soroban_sdk::{contractevent, Address, Env};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ShipmentRequested {
    pub shipment_id: u64,
    pub creator: Address,
    pub sender: Address,
    pub carrier: Address,
}

pub fn publish_shipment_requested(
    env: &Env,
    shipment_id: u64,
    creator: &Address,
    sender: &Address,
    carrier: &Address,
) {
    ShipmentRequested {
        shipment_id,
        creator: creator.clone(),
        sender: sender.clone(),
        carrier: carrier.clone(),
    }
    .publish(env);
}
