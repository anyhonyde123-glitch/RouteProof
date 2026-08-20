#![no_std]
#![allow(clippy::too_many_arguments)]

mod errors;
mod events;
mod shipment_api;
mod storage;
mod types;

pub use errors::Error;
pub use types::{
    HandoffConfig, HandoffRecord, STAGE_PICKUP, STAGE_TO_DELIVERY, STAGE_TO_INSPECTOR,
    STAGE_TO_RECEIVER, STAGE_TRANSIT_TO_WAREHOUSE,
};

use crate::types::ShipmentStatus;
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String};

#[contract]
pub struct HandoffProof;

#[contractimpl]
impl HandoffProof {
    pub fn initialize(env: Env, admin: Address, registry: Address, shipment: Address) {
        if storage::get_config(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_config(
            &env,
            &types::HandoffConfig {
                admin,
                registry,
                shipment,
            },
        );
    }

    pub fn record_handoff(
        env: Env,
        actor: Address,
        shipment_id: u64,
        from_party: Address,
        to_party: Address,
        stage: u32,
        proof_hash: String,
    ) -> u64 {
        let config = storage::get_config(&env).unwrap_or_else(|| {
            panic_with_error!(&env, Error::NotInitialized);
        });
        actor.require_auth();

        if storage::has_stage_handoff(&env, shipment_id, stage) {
            panic_with_error!(&env, Error::DuplicateHandoff);
        }

        let shipment = shipment_api::get_shipment(&env, &config.shipment, shipment_id);
        let handoff_addr = env.current_contract_address();

        let new_status = match stage {
            STAGE_PICKUP => {
                if shipment.status != ShipmentStatus::Created {
                    panic_with_error!(&env, Error::InvalidStatus);
                }
                if from_party != shipment.sender || to_party != shipment.carrier {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                if actor != shipment.sender && actor != shipment.carrier {
                    panic_with_error!(&env, Error::Unauthorized);
                }
                ShipmentStatus::PickedUp
            }
            STAGE_TRANSIT_TO_WAREHOUSE => {
                if shipment.status != ShipmentStatus::InTransit {
                    panic_with_error!(&env, Error::InvalidStatus);
                }
                if from_party != shipment.carrier || to_party != shipment.warehouse {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                ShipmentStatus::WarehouseReceived
            }
            STAGE_TO_INSPECTOR => {
                if shipment.status != ShipmentStatus::WarehouseReceived {
                    panic_with_error!(&env, Error::InvalidStatus);
                }
                if from_party != shipment.warehouse || to_party != shipment.inspector {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                ShipmentStatus::InspectionPending
            }
            STAGE_TO_DELIVERY => {
                if shipment.status != ShipmentStatus::Inspected {
                    panic_with_error!(&env, Error::InvalidStatus);
                }
                if to_party != shipment.carrier {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                if from_party != shipment.warehouse && from_party != shipment.inspector {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                ShipmentStatus::OutForDelivery
            }
            STAGE_TO_RECEIVER => {
                if shipment.status != ShipmentStatus::OutForDelivery {
                    panic_with_error!(&env, Error::InvalidStatus);
                }
                if from_party != shipment.carrier || to_party != shipment.receiver {
                    panic_with_error!(&env, Error::InvalidParties);
                }
                ShipmentStatus::Delivered
            }
            _ => panic_with_error!(&env, Error::InvalidStage),
        };

        shipment_api::advance_status(
            &env,
            &config.shipment,
            &handoff_addr,
            shipment_id,
            new_status,
            &actor,
        );

        let id = storage::bump_next_handoff_id(&env);
        let record = HandoffRecord {
            id,
            shipment_id,
            from_party: from_party.clone(),
            to_party: to_party.clone(),
            stage,
            proof_hash: proof_hash.clone(),
            actor: actor.clone(),
            recorded_at: env.ledger().timestamp(),
        };

        storage::set_handoff(&env, &record);
        storage::set_stage_handoff(&env, shipment_id, stage, id);
        storage::append_shipment_handoff(&env, shipment_id, id);

        events::publish_handoff_recorded(
            &env,
            id,
            shipment_id,
            stage,
            &from_party,
            &to_party,
            &actor,
            &proof_hash,
        );

        id
    }

    pub fn get_handoff(env: Env, id: u64) -> HandoffRecord {
        storage::get_handoff(&env, id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::HandoffNotFound);
        })
    }

    pub fn handoffs_for_shipment_count(env: Env, shipment_id: u64) -> u32 {
        storage::shipment_handoff_count(&env, shipment_id)
    }

    pub fn handoffs_for_shipment(env: Env, shipment_id: u64, index: u32) -> HandoffRecord {
        let handoff_id = storage::get_shipment_handoff_at(&env, shipment_id, index)
            .unwrap_or_else(|| panic_with_error!(&env, Error::HandoffNotFound));
        Self::get_handoff(env, handoff_id)
    }

    pub fn next_id(env: Env) -> u64 {
        storage::next_handoff_id(&env)
    }
}

mod test;
