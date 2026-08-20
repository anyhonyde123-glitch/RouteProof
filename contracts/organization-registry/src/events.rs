use soroban_sdk::{contractevent, Address, Env, String};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrgRegistered {
    pub account: Address,
    pub name: String,
    pub roles: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrgRolesUpdated {
    pub account: Address,
    pub roles: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrgVerifiedUpdated {
    pub account: Address,
    pub verified: bool,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrgActiveUpdated {
    pub account: Address,
    pub active: bool,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AdminTransferred {
    pub old_admin: Address,
    pub new_admin: Address,
}

pub fn publish_org_registered(env: &Env, account: &Address, name: &String, roles: u32) {
    OrgRegistered {
        account: account.clone(),
        name: name.clone(),
        roles,
    }
    .publish(env);
}

pub fn publish_org_roles_updated(env: &Env, account: &Address, roles: u32) {
    OrgRolesUpdated {
        account: account.clone(),
        roles,
    }
    .publish(env);
}

pub fn publish_org_verified_updated(env: &Env, account: &Address, verified: bool) {
    OrgVerifiedUpdated {
        account: account.clone(),
        verified,
    }
    .publish(env);
}

pub fn publish_org_active_updated(env: &Env, account: &Address, active: bool) {
    OrgActiveUpdated {
        account: account.clone(),
        active,
    }
    .publish(env);
}

pub fn publish_admin_transferred(env: &Env, old_admin: &Address, new_admin: &Address) {
    AdminTransferred {
        old_admin: old_admin.clone(),
        new_admin: new_admin.clone(),
    }
    .publish(env);
}
