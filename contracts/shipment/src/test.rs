#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup(env: &Env) -> (Address, Address, ShipmentContractClient<'static>) {
    let admin = Address::generate(env);
    let factory = Address::generate(env);
    let registry = Address::generate(env);
    let handoff = Address::generate(env);
    let inspection = Address::generate(env);
    let settlement = Address::generate(env);

    let contract_id = env.register(ShipmentContract, ());
    let client = ShipmentContractClient::new(env, &contract_id);

    env.mock_all_auths();
    client.initialize(
        &admin,
        &registry,
        &factory,
        &handoff,
        &inspection,
        &settlement,
    );

    (factory, handoff, client)
}

fn create_sample_shipment(env: &Env, client: &ShipmentContractClient, factory: &Address) -> u64 {
    let creator = Address::generate(env);
    let sender = Address::generate(env);
    let carrier = Address::generate(env);
    let warehouse = Address::generate(env);
    let inspector = Address::generate(env);
    let receiver = Address::generate(env);

    client.create_shipment(
        factory,
        &creator,
        &sender,
        &carrier,
        &warehouse,
        &inspector,
        &receiver,
        &String::from_str(env, "Origin"),
        &String::from_str(env, "Destination"),
        &String::from_str(env, "cargo-hash"),
    )
}

#[test]
fn create_shipment_happy_path() {
    let env = Env::default();
    let (factory, _, client) = setup(&env);
    let id = create_sample_shipment(&env, &client, &factory);

    assert_eq!(id, 1);
    assert_eq!(client.next_shipment_id(), 2);
    assert_eq!(client.get_status(&id), ShipmentStatus::Created);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn create_shipment_unauthorized_factory() {
    let env = Env::default();
    let (_, _, client) = setup(&env);
    let impostor = Address::generate(&env);

    client.create_shipment(
        &impostor,
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &String::from_str(&env, "A"),
        &String::from_str(&env, "B"),
        &String::from_str(&env, "hash"),
    );
}

#[test]
fn mark_in_transit_and_advance_status() {
    let env = Env::default();
    let (factory, handoff, client) = setup(&env);
    let id = create_sample_shipment(&env, &client, &factory);
    let shipment = client.get_shipment(&id);
    let carrier = shipment.carrier.clone();
    let sender = shipment.sender.clone();

    client.advance_status(&handoff, &id, &(ShipmentStatus::PickedUp as u32), &sender);
    assert_eq!(client.get_status(&id), ShipmentStatus::PickedUp);

    client.mark_in_transit(&carrier, &id);
    assert_eq!(client.get_status(&id), ShipmentStatus::InTransit);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn invalid_transition_rejected() {
    let env = Env::default();
    let (factory, handoff, client) = setup(&env);
    let id = create_sample_shipment(&env, &client, &factory);

    client.advance_status(
        &handoff,
        &id,
        &(ShipmentStatus::Delivered as u32),
        &Address::generate(&env),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn advance_status_unauthorized_protocol() {
    let env = Env::default();
    let (factory, _, client) = setup(&env);
    let id = create_sample_shipment(&env, &client, &factory);
    let impostor = Address::generate(&env);

    client.advance_status(
        &impostor,
        &id,
        &(ShipmentStatus::PickedUp as u32),
        &Address::generate(&env),
    );
}

#[test]
fn is_participant() {
    let env = Env::default();
    let (factory, _, client) = setup(&env);
    let id = create_sample_shipment(&env, &client, &factory);
    let shipment = client.get_shipment(&id);

    assert!(client.is_participant(&id, &shipment.sender));
    assert!(!client.is_participant(&id, &Address::generate(&env)));
}

#[test]
fn get_config() {
    let env = Env::default();
    let (factory, handoff, client) = setup(&env);
    let config = client.get_config();

    assert_eq!(config.factory, factory);
    assert_eq!(config.handoff, handoff);
}
