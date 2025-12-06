use std::{
    f64::consts::E,
    time::{SystemTime, UNIX_EPOCH},
};

use redis::{AsyncCommands, RedisResult, aio::MultiplexedConnection};
use serde_json::{Number, Value, json};

use crate::{
    core::state_manager::manager_config::{get, set},
    types::payload::{
        BankAccount, IMPSTransactionState, InitUpiPayload, State, UpiTransactionState, UpiTransactionStateWithoutBanks, VerifiedVpa
    },
    utils::parser::{parse_imps_state, parse_upi_state, parse_upi_state_without_banks},
};

pub async fn save_upi_intermidiate_step(
    con: &mut MultiplexedConnection,
    txn_id: &str,
    step: &str,
    processor: &str,
) {
    // println!("Saving UPI intermidiate step");
    if txn_id.is_empty() {
        println!("Transaction Id is missing");
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
                println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txnId": txn_id,
            "toVpa": "",
            "fromVpa": "",
            "amount": "",
            "requestedBy": "",
            "senderBank": {},
            "recieverBank": {},
            "processing_history": [{
                "step": step,
                "time_stamp": ts,
                "processor": processor
            }]
        });

        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn save_upi_transfer_details(payload: InitUpiPayload, con: &mut MultiplexedConnection) {
    let txn_id = &payload.txnId; // Borrow first

    if txn_id.is_empty() {
        println!("Transaction Id is missing");
        return;
    }

    let existing_state = get(con, txn_id).await;

    if let Ok(val) = existing_state {
        match serde_json::from_str::<serde_json::Value>(&val) {
            Ok(mut parsed) => {
                // Now we can move payload fields without worrying about txn_id
                // parsed["txnId"] = Value::String(payload.txnId.clone());
                parsed["toVpa"] = Value::String(payload.toVpa);
                parsed["fromVpa"] = Value::String(payload.fromVpa);
                parsed["requestedBy"] = Value::String(payload.requestedBy);
                parsed["amount"] = Value::Number(payload.amount);

                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {}
        }
    } else {
        let new_transaction = json!({
            "txnId": payload.txnId,
            "toVpa": payload.toVpa,
            "fromVpa": payload.fromVpa,
            "amount": payload.amount,
            "requestedBy": payload.requestedBy,
            "processing_history": [],
            "senderBank": {},
            "recieverBank": {},
        });

        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn save_sender_bank_account(
    txn_id: &str,
    senderBank: &VerifiedVpa,
    con: &mut MultiplexedConnection,
) {
    // println!("Saving sender details");

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
                    .get("senderBank")
                    .and_then(|v| v.as_object())
                    .is_some()
                {
                    parsed["senderBank"] = json!(senderBank)
                }

                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {
                // println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txnId": txn_id,
            "toVpa": "",
            "fromVpa": "",
            "amount": "",
            "requestedBy": "",
            "processing_history": [],
            "senderBank":json!(senderBank),
            "recieverBank": {},
        });

        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn save_reciever_bank_account(
    txn_id: &str,
    recieverBank: &VerifiedVpa,
    con: &mut MultiplexedConnection,
) {
    // println!("Saving Reciever details");

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
                    .get("recieverBank")
                    .and_then(|v| v.as_object())
                    .is_some()
                {
                    parsed["recieverBank"] = json!(recieverBank)
                }

                set(con, txn_id, &parsed.to_string()).await;
            }
            Err(e) => {
                // println!("Failed to parse existing state JSON: {}", e);
            }
        }
    } else {
        let new_transaction = json!({
            "txnId": txn_id,
            "toVpa": "",
            "fromVpa": "",
            "amount": "",
            "requestedBy": "",
            "processing_history": [],
            "senderBank": {},
            "recieverBank": json!(recieverBank),
        });

        set(con, txn_id, &new_transaction.to_string()).await;
    }
}

pub async fn get_upi_saved_state_without_banks(
    txn_id: &str,
    con: &mut MultiplexedConnection,
) -> UpiTransactionStateWithoutBanks {
    let value: String = match con.get(txn_id).await {
        Ok(Some(v)) => v,
        Ok(None) => String::new(),
        Err(e) => {
            // eprintln!("Error fetching state for {}: {}", txn_id, e);
            String::new()
        }
    };
    parse_upi_state_without_banks(&value)
}


pub async fn get_upi_saved_state(
    txn_id: &str,
    con: &mut MultiplexedConnection,
) -> UpiTransactionState {
    let value: String = match con.get(txn_id).await {
        Ok(Some(v)) => v,
        Ok(None) => String::new(),
        Err(e) => {
            // eprintln!("Error fetching state for {}: {}", txn_id, e);
            String::new()
        }
    };
    parse_upi_state(&value)
}
