#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup(env: &Env) -> (Address, OrganizationRegistryClient<'static>) {
    let admin = Address::generate(env);
    let contract_id = env.register(OrganizationRegistry, ());
    let client = OrganizationRegistryClient::new(env, &contract_id);
    env.mock_all_auths();
    client.initialize(&admin);
    (admin, client)
}

#[test]
fn initialize_and_register_org() {
    let env = Env::default();
    let (admin, client) = setup(&env);

    let sender = Address::generate(&env);
    client.register(
        &sender,
        &String::from_str(&env, "SenderCo"),
        &ROLE_SENDER,
    );

    let profile = client.get_org(&sender).unwrap();
    assert_eq!(profile.name, String::from_str(&env, "SenderCo"));
    assert_eq!(profile.roles, ROLE_SENDER);
    assert!(profile.active);
    assert!(!profile.verified);
    assert_eq!(client.get_admin(), admin);
}

#[test]
fn has_role_and_require_role() {
    let env = Env::default();
    let (_, client) = setup(&env);

    let carrier = Address::generate(&env);
    client.register(
        &carrier,
        &String::from_str(&env, "CarrierCo"),
        &ROLE_CARRIER,
    );

    assert!(client.has_role(&carrier, &ROLE_CARRIER));
    assert!(!client.has_role(&carrier, &ROLE_SENDER));
    client.require_role(&carrier, &ROLE_CARRIER);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn require_role_panics_when_missing() {
    let env = Env::default();
    let (_, client) = setup(&env);

    let account = Address::generate(&env);
    client.register(
        &account,
        &String::from_str(&env, "ReceiverCo"),
        &ROLE_RECEIVER,
    );
    client.require_role(&account, &ROLE_SENDER);
}

#[test]
fn add_roles_and_admin_controls() {
    let env = Env::default();
    let (_, client) = setup(&env);

    let account = Address::generate(&env);
    client.register(
        &account,
        &String::from_str(&env, "MultiCo"),
        &ROLE_SENDER,
    );
    client.add_roles(&account, &ROLE_CARRIER);

    assert!(client.has_role(&account, &ROLE_SENDER));
    assert!(client.has_role(&account, &ROLE_CARRIER));

    client.set_verified(&account, &true);
    client.set_active(&account, &false);
    assert!(!client.has_role(&account, &ROLE_SENDER));

    client.set_active(&account, &true);
    assert!(client.has_role(&account, &ROLE_SENDER));
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn duplicate_registration_fails() {
    let env = Env::default();
    let (_, client) = setup(&env);

    let account = Address::generate(&env);
    client.register(
        &account,
        &String::from_str(&env, "DupCo"),
        &ROLE_WAREHOUSE,
    );
    client.register(
        &account,
        &String::from_str(&env, "DupCo2"),
        &ROLE_WAREHOUSE,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn double_initialize_fails() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(OrganizationRegistry, ());
    let client = OrganizationRegistryClient::new(&env, &contract_id);
    env.mock_all_auths();
    client.initialize(&admin);
    client.initialize(&admin);
}

#[test]
fn transfer_admin() {
    let env = Env::default();
    let (admin, client) = setup(&env);

    let new_admin = Address::generate(&env);
    client.transfer_admin(&new_admin);
    assert_eq!(client.get_admin(), new_admin);
    assert_ne!(client.get_admin(), admin);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn get_missing_org_operations_fail() {
    let env = Env::default();
    let (_, client) = setup(&env);

    let missing = Address::generate(&env);
    client.add_roles(&missing, &ROLE_INSPECTOR);
}
