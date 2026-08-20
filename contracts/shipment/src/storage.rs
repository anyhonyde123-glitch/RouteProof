use soroban_sdk::Env;

use crate::types::{DataKey, Shipment, ShipmentConfig};

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

pub fn get_config(env: &Env) -> Option<ShipmentConfig> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn set_config(env: &Env, config: &ShipmentConfig) {
    env.storage().instance().set(&DataKey::Config, config);
    extend_instance_ttl(env);
}

pub fn next_shipment_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextShipmentId)
        .unwrap_or(1)
}

pub fn bump_next_shipment_id(env: &Env) -> u64 {
    let id = next_shipment_id(env);
    env.storage()
        .instance()
        .set(&DataKey::NextShipmentId, &(id + 1));
    extend_instance_ttl(env);
    id
}

pub fn get_shipment(env: &Env, id: u64) -> Option<Shipment> {
    env.storage().persistent().get(&DataKey::Shipment(id))
}

pub fn set_shipment(env: &Env, shipment: &Shipment) {
    let key = DataKey::Shipment(shipment.id);
    env.storage().persistent().set(&key, shipment);
    extend_persistent_ttl(env, &key);
    extend_instance_ttl(env);
}
