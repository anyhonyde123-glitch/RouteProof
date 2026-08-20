use soroban_sdk::{contractevent, Address, Env, String};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HandoffRecorded {
    pub handoff_id: u64,
    pub shipment_id: u64,
    pub stage: u32,
    pub from_party: Address,
    pub to_party: Address,
    pub actor: Address,
    pub proof_hash: String,
}

pub fn publish_handoff_recorded(
    env: &Env,
    handoff_id: u64,
    shipment_id: u64,
    stage: u32,
    from_party: &Address,
    to_party: &Address,
    actor: &Address,
    proof_hash: &String,
) {
    HandoffRecorded {
        handoff_id,
        shipment_id,
        stage,
        from_party: from_party.clone(),
        to_party: to_party.clone(),
        actor: actor.clone(),
        proof_hash: proof_hash.clone(),
    }
    .publish(env);
}
