use std::{
    f64::consts::E,
    time::{SystemTime, UNIX_EPOCH},
};

use redis::{AsyncCommands, RedisResult, aio::MultiplexedConnection};
use serde_json::{Number, json};

use crate::{
    types::payload::{BankAccount, State, TransactionState},
    utils::{imps_flow::Step, parser::parse_state},
};

async fn get(con: &mut MultiplexedConnection, key: &str) -> RedisResult<String> {
    con.get(key).await
}


async fn set(con: &mut MultiplexedConnection, key: &str, value: &str) {
    let _: () = con
        .set(key, value)
        .await
        .unwrap_or_else(|e| println!("Redis Set Error: {}", e));
}

pub async fn save_intermidiate_step(
    con: &mut MultiplexedConnection,
    txn_id: &str,
    step: &str,
    processor: &str,
) {
    // println!("Saving intermidiate step");
    if txn_id.is_empty() {
        // println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(con, txn_id).await;
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis()
        .to_string();
    if let Ok(val) = existing_state {
        
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                
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
                
                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {
                // println!("Failed to parse existing state JSON: {}", e);
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

        
        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn save_remitter(
    txn_id: &str,
    amount: Number,
    remitter: &BankAccount,
    con: &mut MultiplexedConnection,
) {
    // println!("Saving remitter details");

    if txn_id.is_empty() {
        println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(con, txn_id).await;
    if let Ok(val) = existing_state {
        
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                
                let mut parsed = parsed;

                if parsed.get("remitter").and_then(|v| v.as_object()).is_some() {
                    parsed["remitter"] = json!(remitter)
                }
                if parsed.get("amount").and_then(|v| v.as_number()).is_some() {
                    parsed["amount"] = json!(amount);
                }
                
                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {
                // println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txn_id": txn_id,
            "remitter": json!(remitter),
            "benificary": {},
            "amount": amount,
            "processing_history": []
        });

        
        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn save_benificary(
    txn_id: &str,
    benificary: &BankAccount,
    con: &mut MultiplexedConnection,
) {
    // println!("Saving benificary details");

    if txn_id.is_empty() {
        // println!("Transaction Id is missing");
        return;
    }
    let existing_state = get(con, txn_id).await;
    if let Ok(val) = existing_state {
        
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(parsed) => {
                
                let mut parsed = parsed;

                if parsed
                    .get("benificary")
                    .and_then(|v| v.as_object())
                    .is_some()
                {
                    parsed["benificary"] = json!(benificary)
                }
                
                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {
                // println!("Failed to parse existing state JSON: {}", e);
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

        
        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn get_saved_state(txn_id: &str, con: &mut MultiplexedConnection) -> TransactionState {
    let value: String = match con.get(txn_id).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            
            String::new()
        }
        Err(e) => {
            
            // eprintln!("Error fetching state for {}: {}", txn_id, e);
            String::new()
        }
    };

    
    parse_state(&value)
}
