use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};

use crate::types::payload::{AddBankAccount, Payload, TransactionState, VerifiedBankAccount};

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

pub fn parse_state(payload: &str) -> TransactionState {
    if payload.trim().is_empty() {
        eprintln!("ERROR: Empty payload received");
        panic!("Cannot parse empty payload");
    }
    
    match serde_json::from_str(payload) {
        Ok(state) => state,
        Err(e) => {
            eprintln!("ERROR: Failed to parse JSON");
            eprintln!("Payload: {}", payload);
            eprintln!("Error: {}", e);
            panic!("Invalid JSON for TransactionState");
        }
    }
}