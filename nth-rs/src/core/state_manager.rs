use std::time::{SystemTime, UNIX_EPOCH};

use redis::{Client, Commands, RedisResult};
use serde_json::json;

use crate::{
    types::payload::{State, TransactionState},
    utils::{imps_flow::Step, parser::parse_intermidiate_step},
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
        println!("Existing state value: {:?}", val);
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                println!("Parsed existing state JSON: {:?}", parsed);
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
