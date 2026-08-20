use soroban_sdk::Env;

use crate::types::{DataKey, InspectionConfig, InspectionRecord};

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

pub fn get_config(env: &Env) -> Option<InspectionConfig> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn set_config(env: &Env, config: &InspectionConfig) {
    env.storage().instance().set(&DataKey::Config, config);
    extend_instance_ttl(env);
}

pub fn next_inspection_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextInspectionId)
        .unwrap_or(1)
}

pub fn bump_next_inspection_id(env: &Env) -> u64 {
    let id = next_inspection_id(env);
    env.storage()
        .instance()
        .set(&DataKey::NextInspectionId, &(id + 1));
    extend_instance_ttl(env);
    id
}

pub fn is_approved(env: &Env, shipment_id: u64) -> bool {
    env.storage()
        .persistent()
        .get(&DataKey::ApprovedForShipment(shipment_id))
        .unwrap_or(false)
}

pub fn set_approved(env: &Env, shipment_id: u64) {
    let key = DataKey::ApprovedForShipment(shipment_id);
    env.storage().persistent().set(&key, &true);
    extend_persistent_ttl(env, &key);
}

pub fn get_inspection(env: &Env, id: u64) -> Option<InspectionRecord> {
    env.storage().persistent().get(&DataKey::Inspection(id))
}

pub fn set_inspection(env: &Env, record: &InspectionRecord) {
    let key = DataKey::Inspection(record.id);
    env.storage().persistent().set(&key, record);
    extend_persistent_ttl(env, &key);

    let latest_key = DataKey::LatestForShipment(record.shipment_id);
    env.storage().persistent().set(&latest_key, &record.id);
    extend_persistent_ttl(env, &latest_key);

    let count = env
        .storage()
        .persistent()
        .get(&DataKey::InspectionCount(record.shipment_id))
        .unwrap_or(0);
    let index_key = DataKey::InspectionIndex(record.shipment_id, count);
    env.storage().persistent().set(&index_key, &record.id);
    extend_persistent_ttl(env, &index_key);
    let count_key = DataKey::InspectionCount(record.shipment_id);
    env.storage()
        .persistent()
        .set(&count_key, &(count + 1));
    extend_persistent_ttl(env, &count_key);

    extend_instance_ttl(env);
}

pub fn get_latest_for_shipment(env: &Env, shipment_id: u64) -> Option<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::LatestForShipment(shipment_id))
}
