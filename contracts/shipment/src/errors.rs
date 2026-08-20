use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    ShipmentNotFound = 4,
    InvalidTransition = 5,
    NotParticipant = 6,
    InvalidStatus = 7,
}
