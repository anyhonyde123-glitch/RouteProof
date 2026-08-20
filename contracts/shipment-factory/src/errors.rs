use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidSender = 4,
    InvalidCarrier = 5,
    InvalidWarehouse = 6,
    InvalidInspector = 7,
    InvalidReceiver = 8,
}
