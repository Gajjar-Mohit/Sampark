use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};

use crate::types::payload::{AddBankAccount, Payload, VerifiedBankAccount};

pub fn parse_imps_payload(payload: &str) -> Payload {
    let v: Payload = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_upi_add_account_payload(payload: &str) -> AddBankAccount {
    let v: AddBankAccount = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_verified_beneficary(payload: &str) -> VerifiedBankAccount {
    let v: VerifiedBankAccount = serde_json::from_str(payload).unwrap();
    v
}
