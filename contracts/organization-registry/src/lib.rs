#![no_std]

mod errors;
mod events;
mod storage;
mod types;

pub use errors::Error;
pub use types::{
    DataKey, OrgProfile, ROLE_CARRIER, ROLE_INSPECTOR, ROLE_RECEIVER, ROLE_SENDER, ROLE_WAREHOUSE,
};

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String};

#[contract]
pub struct OrganizationRegistry;

#[contractimpl]
impl OrganizationRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if storage::get_admin(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
    }

    pub fn register(env: Env, account: Address, name: String, roles: u32) {
        let admin = Self::require_admin(&env);
        admin.require_auth();

        if storage::get_org(&env, &account).is_some() {
            panic_with_error!(&env, Error::OrgAlreadyExists);
        }

        let profile = OrgProfile {
            account: account.clone(),
            name: name.clone(),
            roles,
            verified: false,
            active: true,
        };
        storage::set_org(&env, &profile);
        events::publish_org_registered(&env, &account, &name, roles);
    }

    pub fn add_roles(env: Env, account: Address, roles: u32) {
        let admin = Self::require_admin(&env);
        admin.require_auth();

        let mut profile = storage::get_org(&env, &account).unwrap_or_else(|| {
            panic_with_error!(&env, Error::OrgNotFound);
        });
        profile.roles |= roles;
        storage::set_org(&env, &profile);
        events::publish_org_roles_updated(&env, &account, profile.roles);
    }

    pub fn set_verified(env: Env, account: Address, verified: bool) {
        let admin = Self::require_admin(&env);
        admin.require_auth();

        let mut profile = storage::get_org(&env, &account).unwrap_or_else(|| {
            panic_with_error!(&env, Error::OrgNotFound);
        });
        profile.verified = verified;
        storage::set_org(&env, &profile);
        events::publish_org_verified_updated(&env, &account, verified);
    }

    pub fn set_active(env: Env, account: Address, active: bool) {
        let admin = Self::require_admin(&env);
        admin.require_auth();

        let mut profile = storage::get_org(&env, &account).unwrap_or_else(|| {
            panic_with_error!(&env, Error::OrgNotFound);
        });
        profile.active = active;
        storage::set_org(&env, &profile);
        events::publish_org_active_updated(&env, &account, active);
    }

    pub fn has_role(env: Env, account: Address, role: u32) -> bool {
        let Some(profile) = storage::get_org(&env, &account) else {
            return false;
        };
        profile.active && profile.roles & role != 0
    }

    pub fn require_role(env: Env, account: Address, role: u32) {
        if !Self::has_role(env.clone(), account, role) {
            panic_with_error!(&env, Error::MissingRole);
        }
    }

    pub fn get_org(env: Env, account: Address) -> Option<OrgProfile> {
        storage::get_org(&env, &account)
    }

    pub fn get_admin(env: Env) -> Address {
        Self::require_admin(&env)
    }

    pub fn transfer_admin(env: Env, new_admin: Address) {
        let admin = Self::require_admin(&env);
        admin.require_auth();
        storage::set_admin(&env, &new_admin);
        events::publish_admin_transferred(&env, &admin, &new_admin);
    }

    fn require_admin(env: &Env) -> Address {
        storage::get_admin(env).unwrap_or_else(|| panic_with_error!(env, Error::NotInitialized))
    }
}

mod test;
