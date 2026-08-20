#![no_std]

mod errors;
mod events;
mod registry_api;
mod shipment_api;
mod storage;
mod types;

pub use errors::Error;
pub use types::{InspectionConfig, InspectionRecord};

use crate::types::{ShipmentStatus, ROLE_INSPECTOR};
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String};

#[contract]
pub struct InspectionContract;

#[contractimpl]
impl InspectionContract {
    pub fn initialize(env: Env, admin: Address, registry: Address, shipment: Address) {
        if storage::get_config(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_config(
            &env,
            &types::InspectionConfig {
                admin,
                registry,
                shipment,
            },
        );
    }

    pub fn submit(
        env: Env,
        inspector: Address,
        shipment_id: u64,
        passed: bool,
        notes_hash: String,
    ) -> u64 {
        let config = storage::get_config(&env).unwrap_or_else(|| {
            panic_with_error!(&env, Error::NotInitialized);
        });
        inspector.require_auth();

        if !registry_api::has_role(&env, &config.registry, &inspector, ROLE_INSPECTOR) {
            panic_with_error!(&env, Error::Unauthorized);
        }

        let shipment = shipment_api::get_shipment(&env, &config.shipment, shipment_id);

        if inspector != shipment.inspector {
            panic_with_error!(&env, Error::Unauthorized);
        }

        if passed && storage::is_approved(&env, shipment_id) {
            panic_with_error!(&env, Error::DuplicateApproval);
        }

        if shipment.status != ShipmentStatus::InspectionPending {
            panic_with_error!(&env, Error::InvalidStatus);
        }

        let id = storage::bump_next_inspection_id(&env);
        let record = InspectionRecord {
            id,
            shipment_id,
            inspector: inspector.clone(),
            passed,
            notes_hash: notes_hash.clone(),
            submitted_at: env.ledger().timestamp(),
        };
        storage::set_inspection(&env, &record);

        events::publish_submitted(&env, id, shipment_id, &inspector, passed);

        if passed {
            let inspection_addr = env.current_contract_address();
            shipment_api::advance_status(
                &env,
                &config.shipment,
                &inspection_addr,
                shipment_id,
                ShipmentStatus::Inspected,
                &inspector,
            );
            storage::set_approved(&env, shipment_id);
            events::publish_approved(&env, id, shipment_id, &inspector);
        } else {
            events::publish_rejected(&env, id, shipment_id, &inspector, &notes_hash);
        }

        id
    }

    pub fn get_inspection(env: Env, id: u64) -> InspectionRecord {
        storage::get_inspection(&env, id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::InspectionNotFound);
        })
    }

    pub fn get_latest_for_shipment(env: Env, shipment_id: u64) -> InspectionRecord {
        let latest_id = storage::get_latest_for_shipment(&env, shipment_id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::InspectionNotFound);
        });
        Self::get_inspection(env, latest_id)
    }
}

mod test;
