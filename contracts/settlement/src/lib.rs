#![no_std]

mod errors;
mod events;
mod shipment_api;
mod storage;
mod types;

pub use errors::Error;
pub use types::{SettlementConfig, SettlementRecord};

use crate::types::ShipmentStatus;
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env};

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    pub fn initialize(env: Env, admin: Address, shipment: Address) {
        if storage::get_config(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_config(
            &env,
            &types::SettlementConfig { admin, shipment },
        );
    }

    pub fn complete(env: Env, actor: Address, shipment_id: u64) {
        let config = storage::get_config(&env).unwrap_or_else(|| {
            panic_with_error!(&env, Error::NotInitialized);
        });
        actor.require_auth();

        if storage::has_settlement(&env, shipment_id) {
            panic_with_error!(&env, Error::AlreadyCompleted);
        }

        let shipment = shipment_api::get_shipment(&env, &config.shipment, shipment_id);

        if actor != shipment.receiver && actor != config.admin {
            panic_with_error!(&env, Error::Unauthorized);
        }

        if shipment.status != ShipmentStatus::Delivered {
            panic_with_error!(&env, Error::InvalidStatus);
        }

        let settlement_addr = env.current_contract_address();
        shipment_api::advance_status(
            &env,
            &config.shipment,
            &settlement_addr,
            shipment_id,
            ShipmentStatus::Completed,
            &actor,
        );

        let record = SettlementRecord {
            shipment_id,
            actor: actor.clone(),
            completed_at: env.ledger().timestamp(),
        };
        storage::set_settlement(&env, &record);

        events::publish_settlement_completed(&env, shipment_id, &actor);
        events::publish_shipment_completed(&env, shipment_id, &actor);
    }

    pub fn get_settlement(env: Env, shipment_id: u64) -> Option<SettlementRecord> {
        storage::get_settlement(&env, shipment_id)
    }
}

mod test;
