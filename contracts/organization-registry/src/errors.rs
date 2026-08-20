use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    OrgNotFound = 3,
    OrgAlreadyExists = 4,
    MissingRole = 5,
    OrgInactive = 6,
    Unauthorized = 7,
}
