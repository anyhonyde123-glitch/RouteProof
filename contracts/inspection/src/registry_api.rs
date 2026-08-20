use soroban_sdk::{Address, Env, IntoVal, Symbol};

pub fn has_role(env: &Env, contract: &Address, account: &Address, role: u32) -> bool {
    env.invoke_contract(
        contract,
        &Symbol::new(env, "has_role"),
        (account, role).into_val(env),
    )
}
