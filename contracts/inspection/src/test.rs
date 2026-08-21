#![cfg(test)]

use super::*;
use handoff_proof::{HandoffProof, STAGE_PICKUP, STAGE_TO_INSPECTOR, STAGE_TRANSIT_TO_WAREHOUSE};
use organization_registry::{
    OrganizationRegistry, OrganizationRegistryClient, ROLE_CARRIER, ROLE_INSPECTOR, ROLE_RECEIVER,
    ROLE_SENDER, ROLE_WAREHOUSE,
};
use shipment::{ShipmentContract, ShipmentContractClient, ShipmentStatus};
use shipment_factory::{ShipmentFactory, ShipmentFactoryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

struct InspectionEnv<'a> {
    inspection: InspectionContractClient<'a>,
    handoff: handoff_proof::HandoffProofClient<'a>,
    shipment: ShipmentContractClient<'a>,
    shipment_id: u64,
    inspector: Address,
    warehouse: Address,
    carrier: Address,
    sender: Address,
}

fn setup_to_inspection_pending(env: &Env) -> InspectionEnv<'_> {
    let admin = Address::generate(env);

    let registry_id = env.register(OrganizationRegistry, ());
    let registry = OrganizationRegistryClient::new(env, &registry_id);

    let shipment_contract_id = env.register(ShipmentContract, ());
    let shipment = ShipmentContractClient::new(env, &shipment_contract_id);

    let factory_id = env.register(ShipmentFactory, ());
    let factory = ShipmentFactoryClient::new(env, &factory_id);

    let handoff_id = env.register(HandoffProof, ());
    let handoff = handoff_proof::HandoffProofClient::new(env, &handoff_id);

    let inspection_id = env.register(InspectionContract, ());
    let inspection = InspectionContractClient::new(env, &inspection_id);

    let settlement = Address::generate(env);

    env.mock_all_auths();

    registry.initialize(&admin);
    shipment.initialize(
        &admin,
        &registry_id,
        &factory_id,
        &handoff_id,
        &inspection_id,
        &settlement,
    );
    factory.initialize(&admin, &registry_id, &shipment_contract_id);
    handoff.initialize(&admin, &registry_id, &shipment_contract_id);
    inspection.initialize(&admin, &registry_id, &shipment_contract_id);

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

    handoff.record_handoff(
        &sender,
        &shipment_id,
        &sender,
        &carrier,
        &STAGE_PICKUP,
        &String::from_str(env, "p1"),
    );
    shipment.mark_in_transit(&carrier, &shipment_id);
    handoff.record_handoff(
        &carrier,
        &shipment_id,
        &carrier,
        &warehouse,
        &STAGE_TRANSIT_TO_WAREHOUSE,
        &String::from_str(env, "p2"),
    );
    handoff.record_handoff(
        &warehouse,
        &shipment_id,
        &warehouse,
        &inspector,
        &STAGE_TO_INSPECTOR,
        &String::from_str(env, "p3"),
    );

    InspectionEnv {
        inspection,
        handoff,
        shipment,
        shipment_id,
        inspector,
        warehouse,
        carrier,
        sender,
    }
}

#[test]
fn approve_inspection_advances_status() {
    let env = Env::default();
    let ctx = setup_to_inspection_pending(&env);

    let id = ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "notes-ok"),
    );

    assert_eq!(id, 1);
    assert_eq!(
        ctx.shipment.get_status(&ctx.shipment_id),
        ShipmentStatus::Inspected
    );
    let record = ctx.inspection.get_latest_for_shipment(&ctx.shipment_id);
    assert!(record.passed);
}

#[test]
fn reject_inspection_keeps_status() {
    let env = Env::default();
    let ctx = setup_to_inspection_pending(&env);

    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &false,
        &String::from_str(&env, "notes-fail"),
    );

    assert_eq!(
        ctx.shipment.get_status(&ctx.shipment_id),
        ShipmentStatus::InspectionPending
    );

    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "notes-retry"),
    );
    assert_eq!(
        ctx.shipment.get_status(&ctx.shipment_id),
        ShipmentStatus::Inspected
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn duplicate_approval_fails() {
    let env = Env::default();
    let ctx = setup_to_inspection_pending(&env);

    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "notes-1"),
    );
    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "notes-2"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn unauthorized_inspector_fails() {
    let env = Env::default();
    let ctx = setup_to_inspection_pending(&env);
    let impostor = Address::generate(&env);

    ctx.inspection.submit(
        &impostor,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "bad"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn submit_wrong_status_fails() {
    let env = Env::default();
    let ctx = setup_to_inspection_pending(&env);

    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &true,
        &String::from_str(&env, "ok"),
    );
    ctx.inspection.submit(
        &ctx.inspector,
        &ctx.shipment_id,
        &false,
        &String::from_str(&env, "late-reject"),
    );
}
