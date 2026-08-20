use soroban_sdk::{Address, Env, IntoVal, Symbol};

use crate::types::{Shipment, ShipmentStatus};

pub fn get_shipment(env: &Env, contract: &Address, id: u64) -> Shipment {
    env.invoke_contract(
        contract,
        &Symbol::new(env, "get_shipment"),
        (id,).into_val(env),
    )
}

pub fn advance_status(
    env: &Env,
    contract: &Address,
    protocol_caller: &Address,
    shipment_id: u64,
    new_status: ShipmentStatus,
    actor: &Address,
) {
    env.invoke_contract::<()>(
        contract,
        &Symbol::new(env, "advance_status"),
        (protocol_caller, shipment_id, new_status as u32, actor).into_val(env),
    );
}
