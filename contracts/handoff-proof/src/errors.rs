use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidStage = 4,
    InvalidParties = 5,
    InvalidStatus = 6,
    DuplicateHandoff = 7,
    HandoffNotFound = 8,
}
