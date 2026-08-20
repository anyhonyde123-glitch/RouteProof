use soroban_sdk::{contractevent, Address, Env, String};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InspectionSubmitted {
    pub inspection_id: u64,
    pub shipment_id: u64,
    pub inspector: Address,
    pub passed: bool,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InspectionApproved {
    pub inspection_id: u64,
    pub shipment_id: u64,
    pub inspector: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InspectionRejected {
    pub inspection_id: u64,
    pub shipment_id: u64,
    pub inspector: Address,
    pub notes_hash: String,
}

pub fn publish_submitted(
    env: &Env,
    inspection_id: u64,
    shipment_id: u64,
    inspector: &Address,
    passed: bool,
) {
    InspectionSubmitted {
        inspection_id,
        shipment_id,
        inspector: inspector.clone(),
        passed,
    }
    .publish(env);
}

pub fn publish_approved(env: &Env, inspection_id: u64, shipment_id: u64, inspector: &Address) {
    InspectionApproved {
        inspection_id,
        shipment_id,
        inspector: inspector.clone(),
    }
    .publish(env);
}

pub fn publish_rejected(
    env: &Env,
    inspection_id: u64,
    shipment_id: u64,
    inspector: &Address,
    notes_hash: &String,
) {
    InspectionRejected {
        inspection_id,
        shipment_id,
        inspector: inspector.clone(),
        notes_hash: notes_hash.clone(),
    }
    .publish(env);
}
