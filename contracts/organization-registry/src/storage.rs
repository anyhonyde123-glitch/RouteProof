use soroban_sdk::{Address, Env};

use crate::types::{DataKey, OrgProfile};

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
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_TTL_THRESHOLD, PERSISTENT_TTL_EXTEND_TO);
}

pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
    extend_instance_ttl(env);
}

pub fn get_org(env: &Env, account: &Address) -> Option<OrgProfile> {
    env.storage()
        .persistent()
        .get(&DataKey::Org(account.clone()))
}

pub fn set_org(env: &Env, profile: &OrgProfile) {
    let key = DataKey::Org(profile.account.clone());
    env.storage().persistent().set(&key, profile);
    extend_persistent_ttl(env, &key);
    extend_instance_ttl(env);
}
