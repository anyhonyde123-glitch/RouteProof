use handoff_proof::{
    HandoffProof, HandoffProofClient, STAGE_PICKUP, STAGE_TO_DELIVERY, STAGE_TO_INSPECTOR,
    STAGE_TO_RECEIVER, STAGE_TRANSIT_TO_WAREHOUSE,
};
use inspection::{InspectionContract, InspectionContractClient};
use organization_registry::{
    OrganizationRegistry, OrganizationRegistryClient, ROLE_CARRIER, ROLE_INSPECTOR, ROLE_RECEIVER,
    ROLE_SENDER, ROLE_WAREHOUSE,
};
use settlement::{SettlementContract, SettlementContractClient};
use shipment::{ShipmentContract, ShipmentContractClient, ShipmentStatus};
use shipment_factory::{ShipmentFactory, ShipmentFactoryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

struct RouteProofProtocol<'a> {
    registry: OrganizationRegistryClient<'a>,
    factory: ShipmentFactoryClient<'a>,
    shipment: ShipmentContractClient<'a>,
    handoff: HandoffProofClient<'a>,
    inspection: InspectionContractClient<'a>,
    settlement: SettlementContractClient<'a>,
    sender: Address,
    carrier: Address,
    warehouse: Address,
    inspector: Address,
    receiver: Address,
    creator: Address,
}

fn deploy_protocol(env: &Env) -> RouteProofProtocol<'_> {
    let admin = Address::generate(env);

    let registry_id = env.register(OrganizationRegistry, ());
    let registry = OrganizationRegistryClient::new(env, &registry_id);

    let shipment_id = env.register(ShipmentContract, ());
    let shipment = ShipmentContractClient::new(env, &shipment_id);

    let factory_id = env.register(ShipmentFactory, ());
    let factory = ShipmentFactoryClient::new(env, &factory_id);

    let handoff_id = env.register(HandoffProof, ());
    let handoff = HandoffProofClient::new(env, &handoff_id);

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
    factory.initialize(&admin, &registry_id, &shipment_id);
    handoff.initialize(&admin, &registry_id, &shipment_id);
    inspection.initialize(&admin, &registry_id, &shipment_id);
    settlement.initialize(&admin, &shipment_id);

    let sender = Address::generate(env);
    let carrier = Address::generate(env);
    let warehouse = Address::generate(env);
    let inspector = Address::generate(env);
    let receiver = Address::generate(env);
    let creator = Address::generate(env);

    registry.register(&sender, &String::from_str(env, "Acme Sender"), &ROLE_SENDER);
    registry.register(
        &carrier,
        &String::from_str(env, "FastCarrier"),
        &ROLE_CARRIER,
    );
    registry.register(
        &warehouse,
        &String::from_str(env, "Central Warehouse"),
        &ROLE_WAREHOUSE,
    );
    registry.register(
        &inspector,
        &String::from_str(env, "Quality Inspectors"),
        &ROLE_INSPECTOR,
    );
    registry.register(
        &receiver,
        &String::from_str(env, "Retail Receiver"),
        &ROLE_RECEIVER,
    );

    RouteProofProtocol {
        registry,
        factory,
        shipment,
        handoff,
        inspection,
        settlement,
        sender,
        carrier,
        warehouse,
        inspector,
        receiver,
        creator,
    }
}

#[test]
fn full_c2c_lifecycle() {
    let env = Env::default();
    let p = deploy_protocol(&env);

    assert!(p.registry.has_role(&p.sender, &ROLE_SENDER));
    assert!(p.registry.has_role(&p.carrier, &ROLE_CARRIER));

    let shipment_id = p.factory.create(
        &p.creator,
        &p.sender,
        &p.carrier,
        &p.warehouse,
        &p.inspector,
        &p.receiver,
        &String::from_str(&env, "New York, NY"),
        &String::from_str(&env, "Los Angeles, CA"),
        &String::from_str(&env, "sha256:cargo-manifest-001"),
    );
    assert_eq!(shipment_id, 1);
    assert_eq!(p.shipment.get_status(&shipment_id), ShipmentStatus::Created);

    p.handoff.record_handoff(
        &p.sender,
        &shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "proof:pickup-signature"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::PickedUp
    );

    p.shipment.mark_in_transit(&p.carrier, &shipment_id);
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::InTransit
    );

    p.handoff.record_handoff(
        &p.carrier,
        &shipment_id,
        &p.carrier,
        &p.warehouse,
        &STAGE_TRANSIT_TO_WAREHOUSE,
        &String::from_str(&env, "proof:warehouse-arrival"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::WarehouseReceived
    );

    p.handoff.record_handoff(
        &p.warehouse,
        &shipment_id,
        &p.warehouse,
        &p.inspector,
        &STAGE_TO_INSPECTOR,
        &String::from_str(&env, "proof:to-inspector"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::InspectionPending
    );

    let inspection_id = p.inspection.submit(
        &p.inspector,
        &shipment_id,
        &true,
        &String::from_str(&env, "notes:passed"),
    );
    assert_eq!(inspection_id, 1);
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::Inspected
    );

    p.handoff.record_handoff(
        &p.inspector,
        &shipment_id,
        &p.inspector,
        &p.carrier,
        &STAGE_TO_DELIVERY,
        &String::from_str(&env, "proof:out-for-delivery"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::OutForDelivery
    );

    p.handoff.record_handoff(
        &p.carrier,
        &shipment_id,
        &p.carrier,
        &p.receiver,
        &STAGE_TO_RECEIVER,
        &String::from_str(&env, "proof:delivered"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::Delivered
    );

    p.settlement.complete(&p.receiver, &shipment_id);
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::Completed
    );

    assert_eq!(p.handoff.handoffs_for_shipment_count(&shipment_id), 5);
    assert!(p.settlement.get_settlement(&shipment_id).is_some());
    assert!(p.shipment.is_participant(&shipment_id, &p.receiver));
}

#[test]
fn inspection_rejection_then_resubmit_lifecycle() {
    let env = Env::default();
    let p = deploy_protocol(&env);

    let shipment_id = p.factory.create(
        &p.creator,
        &p.sender,
        &p.carrier,
        &p.warehouse,
        &p.inspector,
        &p.receiver,
        &String::from_str(&env, "Chicago, IL"),
        &String::from_str(&env, "Miami, FL"),
        &String::from_str(&env, "sha256:cargo-002"),
    );

    p.handoff.record_handoff(
        &p.sender,
        &shipment_id,
        &p.sender,
        &p.carrier,
        &STAGE_PICKUP,
        &String::from_str(&env, "p1"),
    );
    p.shipment.mark_in_transit(&p.carrier, &shipment_id);
    p.handoff.record_handoff(
        &p.carrier,
        &shipment_id,
        &p.carrier,
        &p.warehouse,
        &STAGE_TRANSIT_TO_WAREHOUSE,
        &String::from_str(&env, "p2"),
    );
    p.handoff.record_handoff(
        &p.warehouse,
        &shipment_id,
        &p.warehouse,
        &p.inspector,
        &STAGE_TO_INSPECTOR,
        &String::from_str(&env, "p3"),
    );

    p.inspection.submit(
        &p.inspector,
        &shipment_id,
        &false,
        &String::from_str(&env, "fail:damaged"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::InspectionPending
    );

    p.inspection.submit(
        &p.inspector,
        &shipment_id,
        &true,
        &String::from_str(&env, "pass:repaired"),
    );
    assert_eq!(
        p.shipment.get_status(&shipment_id),
        ShipmentStatus::Inspected
    );
}
