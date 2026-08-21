#![no_std]
#![allow(clippy::too_many_arguments)]

mod errors;
mod events;
mod storage;
mod types;

pub use errors::Error;
pub use types::{DataKey, Shipment, ShipmentConfig, ShipmentStatus};

use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String};

#[contract]
pub struct ShipmentContract;

#[contractimpl]
impl ShipmentContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        registry: Address,
        factory: Address,
        handoff: Address,
        inspection: Address,
        settlement: Address,
    ) {
        if storage::get_config(&env).is_some() {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();

        storage::set_config(
            &env,
            &ShipmentConfig {
                admin,
                registry,
                factory,
                handoff,
                inspection,
                settlement,
            },
        );
    }

    /// Admin-only: rewire protocol contract addresses after a sibling redeploy.
    pub fn set_protocol(
        env: Env,
        registry: Address,
        factory: Address,
        handoff: Address,
        inspection: Address,
        settlement: Address,
    ) {
        let mut config = storage::get_config(&env).unwrap_or_else(|| {
            panic_with_error!(&env, Error::NotInitialized);
        });
        config.admin.require_auth();
        config.registry = registry;
        config.factory = factory;
        config.handoff = handoff;
        config.inspection = inspection;
        config.settlement = settlement;
        storage::set_config(&env, &config);
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_shipment(
        env: Env,
        factory_caller: Address,
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
        let config = Self::require_config(&env);
        factory_caller.require_auth();
        if factory_caller != config.factory {
            panic_with_error!(&env, Error::Unauthorized);
        }

        let id = storage::bump_next_shipment_id(&env);
        let now = env.ledger().timestamp();

        let shipment = Shipment {
            id,
            creator: creator.clone(),
            sender: sender.clone(),
            carrier: carrier.clone(),
            warehouse,
            inspector,
            receiver,
            origin,
            destination,
            cargo_hash,
            status: ShipmentStatus::Created,
            created_at: now,
            updated_at: now,
        };

        storage::set_shipment(&env, &shipment);
        events::publish_shipment_created(&env, id, &creator, &sender, &carrier);
        id
    }

    pub fn advance_status(
        env: Env,
        protocol_caller: Address,
        shipment_id: u64,
        new_status: u32,
        actor: Address,
    ) {
        let config = Self::require_config(&env);
        protocol_caller.require_auth();

        if protocol_caller != config.handoff
            && protocol_caller != config.inspection
            && protocol_caller != config.settlement
        {
            panic_with_error!(&env, Error::Unauthorized);
        }

        let new_status = ShipmentStatus::from_u32(new_status)
            .unwrap_or_else(|| panic_with_error!(&env, Error::InvalidStatus));

        let mut shipment = storage::get_shipment(&env, shipment_id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::ShipmentNotFound);
        });

        if !ShipmentStatus::is_valid_transition(shipment.status, new_status) {
            panic_with_error!(&env, Error::InvalidTransition);
        }

        let old_status = shipment.status;
        shipment.status = new_status;
        shipment.updated_at = env.ledger().timestamp();
        storage::set_shipment(&env, &shipment);
        events::publish_status_changed(&env, shipment_id, old_status, new_status, &actor);
    }

    pub fn mark_in_transit(env: Env, carrier: Address, shipment_id: u64) {
        carrier.require_auth();

        let mut shipment = storage::get_shipment(&env, shipment_id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::ShipmentNotFound);
        });

        if carrier != shipment.carrier {
            panic_with_error!(&env, Error::Unauthorized);
        }

        if shipment.status != ShipmentStatus::PickedUp {
            panic_with_error!(&env, Error::InvalidTransition);
        }

        let old_status = shipment.status;
        shipment.status = ShipmentStatus::InTransit;
        shipment.updated_at = env.ledger().timestamp();
        storage::set_shipment(&env, &shipment);
        events::publish_status_changed(
            &env,
            shipment_id,
            old_status,
            ShipmentStatus::InTransit,
            &carrier,
        );
    }

    pub fn get_shipment(env: Env, id: u64) -> Shipment {
        storage::get_shipment(&env, id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::ShipmentNotFound);
        })
    }

    pub fn get_status(env: Env, id: u64) -> ShipmentStatus {
        Self::get_shipment(env, id).status
    }

    pub fn next_shipment_id(env: Env) -> u64 {
        storage::next_shipment_id(&env)
    }

    pub fn get_config(env: Env) -> ShipmentConfig {
        Self::require_config(&env)
    }

    pub fn is_participant(env: Env, shipment_id: u64, account: Address) -> bool {
        let shipment = storage::get_shipment(&env, shipment_id).unwrap_or_else(|| {
            panic_with_error!(&env, Error::ShipmentNotFound);
        });

        account == shipment.creator
            || account == shipment.sender
            || account == shipment.carrier
            || account == shipment.warehouse
            || account == shipment.inspector
            || account == shipment.receiver
    }

    fn require_config(env: &Env) -> ShipmentConfig {
        storage::get_config(env).unwrap_or_else(|| panic_with_error!(env, Error::NotInitialized))
    }
}

mod test;
