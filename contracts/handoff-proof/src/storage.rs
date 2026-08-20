use soroban_sdk::Env;

use crate::types::{DataKey, HandoffConfig, HandoffRecord};

const INSTANCE_TTL_THRESHOLD: u32 = 518_400;
const INSTANCE_TTL_EXTEND_TO: u32 = 2_592_000;
const PERSISTENT_TTL_THRESHOLD: u32 = 518_400;
const PERSISTENT_TTL_EXTEND_TO: u32 = 2_592_000;

pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}

fn extend_persistent_ttl(env: &Env, key: &DataKey) {
    env.storage().persistent().extend_ttl(
        key,
        PERSISTENT_TTL_THRESHOLD,
        PERSISTENT_TTL_EXTEND_TO,
    );
}

pub fn get_config(env: &Env) -> Option<HandoffConfig> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn set_config(env: &Env, config: &HandoffConfig) {
    env.storage().instance().set(&DataKey::Config, config);
    extend_instance_ttl(env);
}

pub fn next_handoff_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextHandoffId)
        .unwrap_or(1)
}

pub fn bump_next_handoff_id(env: &Env) -> u64 {
    let id = next_handoff_id(env);
    env.storage()
        .instance()
        .set(&DataKey::NextHandoffId, &(id + 1));
    extend_instance_ttl(env);
    id
}

pub fn has_stage_handoff(env: &Env, shipment_id: u64, stage: u32) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::StageKey(shipment_id, stage))
}

pub fn set_stage_handoff(env: &Env, shipment_id: u64, stage: u32, handoff_id: u64) {
    let key = DataKey::StageKey(shipment_id, stage);
    env.storage().persistent().set(&key, &handoff_id);
    extend_persistent_ttl(env, &key);
}

pub fn get_handoff(env: &Env, id: u64) -> Option<HandoffRecord> {
    env.storage().persistent().get(&DataKey::Handoff(id))
}

pub fn set_handoff(env: &Env, record: &HandoffRecord) {
    let key = DataKey::Handoff(record.id);
    env.storage().persistent().set(&key, record);
    extend_persistent_ttl(env, &key);
    extend_instance_ttl(env);
}

pub fn shipment_handoff_count(env: &Env, shipment_id: u64) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::ShipmentCount(shipment_id))
        .unwrap_or(0)
}

pub fn append_shipment_handoff(env: &Env, shipment_id: u64, handoff_id: u64) {
    let count = shipment_handoff_count(env, shipment_id);
    let index_key = DataKey::ShipmentIndex(shipment_id, count);
    env.storage().persistent().set(&index_key, &handoff_id);
    extend_persistent_ttl(env, &index_key);

    let count_key = DataKey::ShipmentCount(shipment_id);
    env.storage()
        .persistent()
        .set(&count_key, &(count + 1));
    extend_persistent_ttl(env, &count_key);
}

pub fn get_shipment_handoff_at(env: &Env, shipment_id: u64, index: u32) -> Option<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::ShipmentIndex(shipment_id, index))
}
