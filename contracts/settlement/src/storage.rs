use soroban_sdk::Env;

use crate::types::{DataKey, SettlementConfig, SettlementRecord};

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

pub fn get_config(env: &Env) -> Option<SettlementConfig> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn set_config(env: &Env, config: &SettlementConfig) {
    env.storage().instance().set(&DataKey::Config, config);
    extend_instance_ttl(env);
}

pub fn get_settlement(env: &Env, shipment_id: u64) -> Option<SettlementRecord> {
    env.storage()
        .persistent()
        .get(&DataKey::Settlement(shipment_id))
}

pub fn set_settlement(env: &Env, record: &SettlementRecord) {
    let key = DataKey::Settlement(record.shipment_id);
    env.storage().persistent().set(&key, record);
    extend_persistent_ttl(env, &key);
    extend_instance_ttl(env);
}

pub fn has_settlement(env: &Env, shipment_id: u64) -> bool {
    env.storage().persistent().has(&DataKey::Settlement(shipment_id))
}
