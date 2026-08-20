#![cfg(test)]

use super::*;
use organization_registry::{
    OrganizationRegistry, OrganizationRegistryClient, ROLE_CARRIER, ROLE_INSPECTOR,
    ROLE_RECEIVER, ROLE_SENDER, ROLE_WAREHOUSE,
};
use shipment::{ShipmentContract, ShipmentContractClient, ShipmentStatus};
use shipment_factory::{ShipmentFactory, ShipmentFactoryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

struct ProtocolEnv<'a> {
    handoff: HandoffProofClient<'a>,
    shipment: ShipmentContractClient<'a>,
    shipment_id: u64,
    sender: Address,
    carrier: Address,
    warehouse: Address,
    inspector: Address,
    receiver: Address,
}

fn setup(env: &Env) -> ProtocolEnv<'_> {
    let admin = Address::generate(env);

    let registry_id = env.register(OrganizationRegistry, ());
    let registry = OrganizationRegistryClient::new(env, &registry_id);

    let shipment_contract_id = env.register(ShipmentContract, ());
    let shipment = ShipmentContractClient::new(env, &shipment_contract_id);

    let factory_id = env.register(ShipmentFactory, ());
    let factory = ShipmentFactoryClient::new(env, &factory_id);

    let handoff_id = env.register(HandoffProof, ());
    let handoff = HandoffProofClient::new(env, &handoff_id);

    let inspection = Address::generate(env);
    let settlement = Address::generate(env);

    env.mock_all_auths();

    registry.initialize(&admin);
    shipment.initialize(
        &admin,
        &registry_id,
        &factory_id,
        &handoff_id,
        &inspection,
        &settlement,
    );
    factory.initialize(&admin, &registry_id, &shipment_contract_id);
    handoff.initialize(&admin, &registry_id, &shipment_contract_id);

    let sender = Address::generate(env);
    let carrier = Address::generate(env);
    let warehouse = Address::generate(env);
    let inspector = Address::generate(env);
    let receiver = Address::generate(env);
    let creator = Address::generate(env);

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

    let shipment_id = factory.create(
        &creator,
        &sender,
        &carrier,
        &warehouse,
        &inspector,
        &receiver,
        &String::from_str(env, "A"),
        &String::from_str(env, "B"),
        &String::from_str(env, "hash"),
    );

    ProtocolEnv {
        handoff,
        shipment,
        shipment_id,
        sender,
        carrier,
        warehouse,
        inspector,
        receiver,
    }
}

#[test]
fn pickup_handoff_advances_status() {
    let env = Env::default();
    let p = setup(&env);

    let id = p.handoff.record_handoff(
        &p.sender,
        &p.shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "proof-pickup"),
    );

    assert_eq!(id, 1);
    assert_eq!(
        p.shipment.get_status(&p.shipment_id),
        ShipmentStatus::PickedUp
    );
    assert_eq!(p.handoff.handoffs_for_shipment_count(&p.shipment_id), 1);
}

#[test]
fn full_handoff_sequence() {
    let env = Env::default();
    let p = setup(&env);

    p.handoff.record_handoff(
        &p.sender,
        &p.shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "p1"),
    );
    p.shipment.mark_in_transit(&p.carrier, &p.shipment_id);
    p.handoff.record_handoff(
        &p.carrier,
        &p.shipment_id,
        &p.carrier,
        &p.warehouse,
        &STAGE_TRANSIT_TO_WAREHOUSE,
        &String::from_str(&env, "p2"),
    );
    p.handoff.record_handoff(
        &p.warehouse,
        &p.shipment_id,
        &p.warehouse,
        &p.inspector,
        &STAGE_TO_INSPECTOR,
        &String::from_str(&env, "p3"),
    );

    assert_eq!(
        p.shipment.get_status(&p.shipment_id),
        ShipmentStatus::InspectionPending
    );
    assert_eq!(p.handoff.handoffs_for_shipment_count(&p.shipment_id), 3);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn duplicate_handoff_stage_fails() {
    let env = Env::default();
    let p = setup(&env);

    p.handoff.record_handoff(
        &p.sender,
        &p.shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "p1"),
    );
    p.handoff.record_handoff(
        &p.sender,
        &p.shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "p1-dup"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn unauthorized_actor_fails() {
    let env = Env::default();
    let p = setup(&env);
    let stranger = Address::generate(&env);

    p.handoff.record_handoff(
        &stranger,
        &p.shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "bad"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn invalid_parties_fails() {
    let env = Env::default();
    let p = setup(&env);

    p.handoff.record_handoff(
        &p.sender,
        &p.shipment_id,
        &p.carrier,
        &p.sender,
        &STAGE_PICKUP,
        &String::from_str(&env, "bad-parties"),
    );
}
