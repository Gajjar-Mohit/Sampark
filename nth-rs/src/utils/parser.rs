use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};

use crate::types::payload::{
    AddBankAccount, DebitRemitterPayload, IMPSTransactionState, InitUpiPayload, Payload, UpiTransactionState, UpiTransactionStateWithoutBanks, VerifiedBankAccount, VerifiedUpiBankAccount, VerifiedVpa
};

pub fn parse_imps_payload(payload: &str) -> Payload {
    let v: Payload = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_upi_add_account_payload(payload: &str) -> AddBankAccount {
    let v: AddBankAccount = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_upi_account_added_payload(payload: &str) -> VerifiedUpiBankAccount {
    let v: VerifiedUpiBankAccount = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_verified_beneficary(payload: &str) -> VerifiedBankAccount {
    let v: VerifiedBankAccount = serde_json::from_str(payload).unwrap();
    v
}

pub fn parse_imps_state(payload: &str) -> IMPSTransactionState {
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

pub fn parse_upi_state(payload: &str) -> UpiTransactionState {
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
            panic!("Invalid JSON for UpiTransactionState");
        }
    }
}

pub fn parse_upi_state_without_banks(payload: &str) -> UpiTransactionStateWithoutBanks {
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
            panic!("Invalid JSON for UpiTransactionState");
        }
    }
}

pub fn parse_upi_init_payload(payload: &str) -> InitUpiPayload {
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

pub fn parse_verified_vpa_payload(payload: &str) -> VerifiedVpa {
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


pub fn parse_debit_remitter_payload(payload: &str) -> DebitRemitterPayload {
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
