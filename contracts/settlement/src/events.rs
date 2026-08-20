use soroban_sdk::{contractevent, Address, Env};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SettlementCompleted {
    pub shipment_id: u64,
    pub actor: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ShipmentCompleted {
    pub shipment_id: u64,
    pub actor: Address,
}

pub fn publish_settlement_completed(env: &Env, shipment_id: u64, actor: &Address) {
    SettlementCompleted {
        shipment_id,
        actor: actor.clone(),
    }
    .publish(env);
}

pub fn publish_shipment_completed(env: &Env, shipment_id: u64, actor: &Address) {
    ShipmentCompleted {
        shipment_id,
        actor: actor.clone(),
    }
    .publish(env);
}
