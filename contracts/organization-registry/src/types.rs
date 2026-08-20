use soroban_sdk::{contracttype, Address, String};

pub const ROLE_SENDER: u32 = 1;
pub const ROLE_CARRIER: u32 = 2;
pub const ROLE_WAREHOUSE: u32 = 4;
pub const ROLE_INSPECTOR: u32 = 8;
pub const ROLE_RECEIVER: u32 = 16;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrgProfile {
    pub account: Address,
    pub name: String,
    pub roles: u32,
    pub verified: bool,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Org(Address),
}
