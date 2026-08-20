#![cfg(test)]

use super::*;
use handoff_proof::{
    HandoffProof, STAGE_PICKUP, STAGE_TO_DELIVERY, STAGE_TO_INSPECTOR, STAGE_TO_RECEIVER,
    STAGE_TRANSIT_TO_WAREHOUSE,
};
use inspection::{InspectionContract, InspectionContractClient};
use organization_registry::{
    OrganizationRegistry, OrganizationRegistryClient, ROLE_CARRIER, ROLE_INSPECTOR,
    ROLE_RECEIVER, ROLE_SENDER, ROLE_WAREHOUSE,
};
use shipment::{ShipmentContract, ShipmentContractClient, ShipmentStatus};
use shipment_factory::{ShipmentFactory, ShipmentFactoryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

struct SettlementEnv<'a> {
    settlement: SettlementContractClient<'a>,
    shipment: ShipmentContractClient<'a>,
    shipment_id: u64,
    receiver: Address,
    admin: Address,
}

fn setup_to_delivered(env: &Env) -> SettlementEnv<'_> {
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

    let settlement_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(env, &settlement_id);

    env.mock_all_auths();

    registry.initialize(&admin);
    shipment.initialize(
        &admin,
        &registry_id,
        &factory_id,
        &handoff_id,
        &inspection_id,
        &settlement_id,
    );
    factory.initialize(&admin, &registry_id, &shipment_contract_id);
    handoff.initialize(&admin, &registry_id, &shipment_contract_id);
    inspection.initialize(&admin, &registry_id, &shipment_contract_id);
    settlement.initialize(&admin, &shipment_contract_id);

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
    inspection.submit(
        &inspector,
        &shipment_id,
        &true,
        &String::from_str(env, "ok"),
    );
    handoff.record_handoff(
        &warehouse,
        &shipment_id,
        &warehouse,
        &carrier,
        &STAGE_TO_DELIVERY,
        &String::from_str(env, "p4"),
    );
    handoff.record_handoff(
        &carrier,
        &shipment_id,
        &carrier,
        &receiver,
        &STAGE_TO_RECEIVER,
        &String::from_str(env, "p5"),
    );

    SettlementEnv {
        settlement,
        shipment,
        shipment_id,
        receiver,
        admin,
    }
}

#[test]
fn complete_settlement_happy_path() {
    let env = Env::default();
    let ctx = setup_to_delivered(&env);

    ctx.settlement.complete(&ctx.receiver, &ctx.shipment_id);

    assert_eq!(
        ctx.shipment.get_status(&ctx.shipment_id),
        ShipmentStatus::Completed
    );
    let record = ctx.settlement.get_settlement(&ctx.shipment_id).unwrap();
    assert_eq!(record.actor, ctx.receiver);
}

#[test]
fn admin_can_complete() {
    let env = Env::default();
    let ctx = setup_to_delivered(&env);

    ctx.settlement.complete(&ctx.admin, &ctx.shipment_id);
    assert_eq!(
        ctx.shipment.get_status(&ctx.shipment_id),
        ShipmentStatus::Completed
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn double_completion_fails() {
    let env = Env::default();
    let ctx = setup_to_delivered(&env);

    ctx.settlement.complete(&ctx.receiver, &ctx.shipment_id);
    ctx.settlement.complete(&ctx.receiver, &ctx.shipment_id);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn unauthorized_actor_fails() {
    let env = Env::default();
    let ctx = setup_to_delivered(&env);
    let stranger = Address::generate(&env);

    ctx.settlement.complete(&stranger, &ctx.shipment_id);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn complete_before_delivered_fails() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let factory = Address::generate(&env);
    let handoff = Address::generate(&env);
    let inspection = Address::generate(&env);
    let shipment_contract_id = env.register(ShipmentContract, ());
    let shipment = ShipmentContractClient::new(&env, &shipment_contract_id);
    let settlement_id = env.register(SettlementContract, ());
    let settlement = SettlementContractClient::new(&env, &settlement_id);

    env.mock_all_auths();
    shipment.initialize(
        &admin,
        &Address::generate(&env),
        &factory,
        &handoff,
        &inspection,
        &settlement_id,
    );
    settlement.initialize(&admin, &shipment_contract_id);

    let creator = Address::generate(&env);
    let receiver = Address::generate(&env);
    let shipment_id = shipment.create_shipment(
        &factory,
        &creator,
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &receiver,
        &String::from_str(&env, "A"),
        &String::from_str(&env, "B"),
        &String::from_str(&env, "h"),
    );

    settlement.complete(&receiver, &shipment_id);
}
