use soroban_sdk::{Address, Env, IntoVal, String, Symbol};

pub fn create_shipment(
    env: &Env,
    contract: &Address,
    factory_caller: &Address,
    creator: &Address,
    sender: &Address,
    carrier: &Address,
    warehouse: &Address,
    inspector: &Address,
    receiver: &Address,
    origin: &String,
    destination: &String,
    cargo_hash: &String,
) -> u64 {
    env.invoke_contract(
        contract,
        &Symbol::new(env, "create_shipment"),
        (
            factory_caller,
            creator,
            sender,
            carrier,
            warehouse,
            inspector,
            receiver,
            origin,
            destination,
            cargo_hash,
        )
            .into_val(env),
    )
}
