#![cfg(test)]

use super::*;
use organization_registry::{OrganizationRegistry, OrganizationRegistryClient};
use shipment::{ShipmentContract, ShipmentContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup(
    env: &Env,
) -> (
    ShipmentFactoryClient<'static>,
    Address,
    Address,
    Address,
    Address,
    Address,
) {
    let admin = Address::generate(env);

    let registry_id = env.register(OrganizationRegistry, ());
    let registry = OrganizationRegistryClient::new(env, &registry_id);

    let shipment_id = env.register(ShipmentContract, ());
    let shipment = ShipmentContractClient::new(env, &shipment_id);

    let factory_id = env.register(ShipmentFactory, ());
    let factory = ShipmentFactoryClient::new(env, &factory_id);

    let handoff = Address::generate(env);
    let inspection = Address::generate(env);
    let settlement = Address::generate(env);

    env.mock_all_auths();
    registry.initialize(&admin);
    shipment.initialize(
        &admin,
        &registry_id,
        &factory_id,
        &handoff,
        &inspection,
        &settlement,
    );
    factory.initialize(&admin, &registry_id, &shipment_id);

    let sender = Address::generate(env);
    let carrier = Address::generate(env);
    let warehouse = Address::generate(env);
    let inspector = Address::generate(env);
    let receiver = Address::generate(env);

    registry.register(&sender, &String::from_str(env, "Sender"), &ROLE_SENDER);
    registry.register(&carrier, &String::from_str(env, "Carrier"), &ROLE_CARRIER);
    registry.register(
        &warehouse,
        &String::from_str(env, "Warehouse"),
        &ROLE_WAREHOUSE,
    );
    registry.register(
        &inspector,
        &String::from_str(env, "Inspector"),
        &ROLE_INSPECTOR,
    );
    registry.register(
        &receiver,
        &String::from_str(env, "Receiver"),
        &ROLE_RECEIVER,
    );

    (factory, sender, carrier, warehouse, inspector, receiver)
}

#[test]
fn create_shipment_with_valid_roles() {
    let env = Env::default();
    let (factory, sender, carrier, warehouse, inspector, receiver) = setup(&env);
    let creator = Address::generate(&env);

    let shipment_id = factory.create(
        &creator,
        &sender,
        &carrier,
        &warehouse,
        &inspector,
        &receiver,
        &String::from_str(&env, "NYC"),
        &String::from_str(&env, "LA"),
        &String::from_str(&env, "cargo-1"),
    );

    assert_eq!(shipment_id, 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn create_fails_without_sender_role() {
    let env = Env::default();
    let (factory, _, carrier, warehouse, inspector, receiver) = setup(&env);
    let creator = Address::generate(&env);
    let bad_sender = Address::generate(&env);

    factory.create(
        &creator,
        &bad_sender,
        &carrier,
        &warehouse,
        &inspector,
        &receiver,
        &String::from_str(&env, "NYC"),
        &String::from_str(&env, "LA"),
        &String::from_str(&env, "cargo-1"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn create_fails_without_carrier_role() {
    let env = Env::default();
    let (factory, sender, _, warehouse, inspector, receiver) = setup(&env);
    let creator = Address::generate(&env);
    let bad_carrier = Address::generate(&env);

    factory.create(
        &creator,
        &sender,
        &bad_carrier,
        &warehouse,
        &inspector,
        &receiver,
        &String::from_str(&env, "NYC"),
        &String::from_str(&env, "LA"),
        &String::from_str(&env, "cargo-1"),
    );
}

#[test]
fn get_config() {
    let env = Env::default();
    let (factory, ..) = setup(&env);
    let config = factory.get_config();
    assert!(config.registry != config.shipment);
}
