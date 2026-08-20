use soroban_sdk::Env;

use crate::types::{DataKey, FactoryConfig};

const INSTANCE_TTL_THRESHOLD: u32 = 518_400;
const INSTANCE_TTL_EXTEND_TO: u32 = 2_592_000;

pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}

pub fn get_config(env: &Env) -> Option<FactoryConfig> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn set_config(env: &Env, config: &FactoryConfig) {
    env.storage().instance().set(&DataKey::Config, config);
    extend_instance_ttl(env);
}
