use std::{
    f64::consts::E,
    time::{SystemTime, UNIX_EPOCH},
};

use redis::{Client, Commands, RedisResult};
use serde_json::json;

use crate::{
    types::payload::{BankAccount, State, TransactionState},
    utils::{imps_flow::Step, parser::parse_state},
};

fn connect() -> Client {
    let mut client = Client::open("redis://redis-stack:6379/").unwrap();
    client
}

fn set(key: &str, value: &str) {
    let mut client = connect();
    let _: () = client.set(key, value).expect("Failed to set value");
}

fn get(key: &str) -> RedisResult<String> {
    let mut client = connect();
    let value: String = client.get(key)?;
    Ok(value)
}

pub fn save_intermidiate_step(txn_id: &str, step: &str, processor: &str) {
    println!("Saving intermidiate step");
    if txn_id.is_empty() {
        println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(txn_id);
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis()
        .to_string();
    if let Ok(val) = existing_state {
        // println!("Existing state value: {:?}", val);
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                // println!("Parsed existing state JSON: {:?}", parsed);
                let mut parsed = parsed;
                let new_entry = json!({
                    "step": step,
                    "time_stamp": ts,
                    "processor": processor
                });
                if parsed
                    .get("processing_history")
                    .and_then(|v| v.as_array())
                    .is_some()
                {
                    parsed["processing_history"]
                        .as_array_mut()
                        .unwrap()
                        .push(new_entry);
                } else {
                    parsed["processing_history"] = json!([new_entry]);
                }
                // persist updated transaction JSON
                set(txn_id, &parsed.to_string());
            }
            Err(e) => {
                println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txn_id": txn_id,
            "remitter": {},
            "benificary": {},
            "amount": 0,
            "processing_history": [{
                "step": step,
                "time_stamp": ts,
                "processor": processor
            }]
        });

        // persist the new transaction as a JSON string
        set(txn_id, &new_transaction.to_string());
    }
}

pub fn save_remitter(txn_id: &str, amount: &str, remitter: &BankAccount) {
    println!("Saving remitter details");

    if txn_id.is_empty() {
        println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(txn_id);
    if let Ok(val) = existing_state {
        // println!("Existing state value: {:?}", val);
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                // println!("Parsed existing state JSON: {:?}", parsed);
                let mut parsed = parsed;

                if parsed.get("remitter").and_then(|v| v.as_object()).is_some() {
                    parsed["remitter"] = json!(remitter)
                }
                if parsed.get("amount").and_then(|v| v.as_number()).is_some() {
                    parsed["amount"] = json!(amount);
                }
                // persist updated transaction JSON
                set(txn_id, &parsed.to_string());
            }
            Err(e) => {
                println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txn_id": txn_id,
            "remitter": json!(remitter),
            "benificary": {},
            "amount": 0,
            "processing_history": []
        });

        // persist the new transaction as a JSON string
        set(txn_id, &new_transaction.to_string());
    }
}

pub fn save_benificary(txn_id: &str, benificary: &BankAccount) {
    println!("Saving benificary details");

    if txn_id.is_empty() {
        println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(txn_id);
    if let Ok(val) = existing_state {
        // println!("Existing state value: {:?}", val);
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                // println!("Parsed existing state JSON: {:?}", parsed);
                let mut parsed = parsed;

                if parsed
                    .get("benificary")
                    .and_then(|v| v.as_object())
                    .is_some()
                {
                    parsed["benificary"] = json!(benificary)
                }
                // persist updated transaction JSON
                set(txn_id, &parsed.to_string());
            }
            Err(e) => {
                println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txn_id": txn_id,
            "remitter":  {},
            "benificary":json!(benificary),
            "amount": 0,
            "processing_history": []
        });

        // persist the new transaction as a JSON string
        set(txn_id, &new_transaction.to_string());
    }
}

pub fn get_saved_state(txn_id: &str) -> TransactionState {
    let result = get(txn_id);
    let mut value: String = String::new();
    match result {
        Ok(val) => value = val,
        Err(e) => {
            println!("Error getting saved state: {}", e)
        }
    }

    let parsed_state = parse_state(&value);
    parsed_state
}
