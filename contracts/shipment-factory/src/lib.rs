#![no_std]
#![allow(clippy::too_many_arguments)]

mod errors;
mod events;
mod registry_api;
mod shipment_api;
mod storage;
mod types;

pub use errors::Error;
pub use types::FactoryConfig;

use crate::types::{
    ROLE_CARRIER, ROLE_INSPECTOR, ROLE_RECEIVER, ROLE_SENDER, ROLE_WAREHOUSE,
};
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String};

#[contract]
pub struct ShipmentFactory;

#[contractimpl]
impl ShipmentFactory {
    pub fn initialize(env: Env, admin: Address, registry: Address, shipment: Address) {
        if storage::get_config(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_config(
            &env,
            &types::FactoryConfig {
                admin,
                registry,
                shipment,
            },
        );
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create(
        env: Env,
        creator: Address,
        sender: Address,
        carrier: Address,
        warehouse: Address,
        inspector: Address,
        receiver: Address,
        origin: String,
        destination: String,
        cargo_hash: String,
    ) -> u64 {
        let config = storage::get_config(&env).unwrap_or_else(|| {
            panic_with_error!(&env, Error::NotInitialized);
        });
        creator.require_auth();

        if !registry_api::has_role(&env, &config.registry, &sender, ROLE_SENDER) {
            panic_with_error!(&env, Error::InvalidSender);
        }
        if !registry_api::has_role(&env, &config.registry, &carrier, ROLE_CARRIER) {
            panic_with_error!(&env, Error::InvalidCarrier);
        }
        if !registry_api::has_role(&env, &config.registry, &warehouse, ROLE_WAREHOUSE) {
            panic_with_error!(&env, Error::InvalidWarehouse);
        }
        if !registry_api::has_role(&env, &config.registry, &inspector, ROLE_INSPECTOR) {
            panic_with_error!(&env, Error::InvalidInspector);
        }
        if !registry_api::has_role(&env, &config.registry, &receiver, ROLE_RECEIVER) {
            panic_with_error!(&env, Error::InvalidReceiver);
        }

        let factory_addr = env.current_contract_address();
        let shipment_id = shipment_api::create_shipment(
            &env,
            &config.shipment,
            &factory_addr,
            &creator,
            &sender,
            &carrier,
            &warehouse,
            &inspector,
            &receiver,
            &origin,
            &destination,
            &cargo_hash,
        );

        events::publish_shipment_requested(&env, shipment_id, &creator, &sender, &carrier);
        shipment_id
    }

    pub fn get_config(env: Env) -> FactoryConfig {
        storage::get_config(&env).unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized))
    }
}

mod test;
