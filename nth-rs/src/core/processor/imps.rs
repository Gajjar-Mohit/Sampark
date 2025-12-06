use std::{ptr::null, thread::panicking};

use rdkafka::producer::FutureProducer;
use redis::aio::MultiplexedConnection;
use serde_json::{Value, json};

use crate::{
    config::banks::BANKS,
    core::{
        producer::forward_to_bank,
        state_manager::imps_state_manager::{
             get_saved_state, save_benificary, save_intermidiate_step, save_remitter
        },
    },
    types::payload::{self, BankAccount, IMPSTransactionState, Payload},
    utils::{
        imps_flow::imps_flow,
        parser::{parse_imps_payload, parse_verified_beneficary},
    },
};

pub async fn process_imps_request(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // println!("--------------------------------------------------");
    // println!("Processing IMPS Request | Topic: {} | Key: {}", topic, key);
    // println!("--------------------------------------------------");

    for state in imps_flow.iter() {
        if state.key == key {
            let txn_id_res: Result<serde_json::Value, _> = serde_json::from_str(payload);

            if let Ok(txn_json) = txn_id_res {
                let txn_id_str = txn_json["txnId"].as_str().unwrap_or_default();
                save_intermidiate_step(redis_con, txn_id_str, &state.step, topic).await;
            }

            if key == "imps-transfer" {
                verify_bank_details(topic, key, payload, producer, redis_con).await;
            } else if key == "imps-transfer-error" {
                forward_to_bank(topic, key, payload, producer).await;
            } else if key == "imps-transfer-verified-details" {
                debit_remitter(topic, key, payload, producer, redis_con).await;
            } else if key == "imps-transfer-debit-remitter-success" {
                credit_beneficiary(topic, key, payload, producer, redis_con).await;
            } else if key == "imps-transfer-credit-benificiary-success" {
                transaction_complete(topic, key, payload, producer, redis_con).await;
            }
        }
    }
}

async fn verify_bank_details(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    let payload_struct: Payload = parse_imps_payload(payload);
    let error_key = "imps-transfer-error";

    if payload_struct.beneficiaryDetails.accountNo.is_empty()
        && payload_struct.beneficiaryDetails.mmid.is_empty()
    {
        let error_value = "Missing account no or mmid";
        // print!("{}", error_value);
        forward_to_bank(topic, error_key, error_value, producer).await;
        return;
    }

    if payload_struct.amount.is_empty() {
        let error_value = "Missing amount";
        // print!("{}", error_value);
        forward_to_bank(topic, error_key, error_value, producer).await;
        return;
    }

    if !payload_struct.beneficiaryDetails.accountNo.is_empty()
        && !payload_struct.beneficiaryDetails.ifscCode.is_empty()
    {
        save_remitter(
            &payload_struct.txnId,
            payload_struct.amount.parse().unwrap(),
            &payload_struct.remitterDetails,
            redis_con,
        )
        .await;

        let key = "imps-transfer-verify-details";
        let bank_code = &payload_struct.beneficiaryDetails.ifscCode[0..3];
        let bank = BANKS.get_bank_by_code(bank_code);

        let prepared_payload = json!({
            "ifscCode": payload_struct.beneficiaryDetails.ifscCode,
            "accountNo": payload_struct.beneficiaryDetails.accountNo,
            "replyTo": bank.bank_to_nth,
            "txnId": payload_struct.txnId
        });

        let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();
        forward_to_bank(&bank.nth_to_bank, key, &stringify_payload, producer).await;
    } else {
        let error_value = "Missing accountno or ifsc code";
        forward_to_bank(topic, error_key, error_value, producer).await;
    }
}

async fn debit_remitter(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // println!("Debitting remitter");
    let parsed_payload = parse_verified_beneficary(payload);
    let benificary: BankAccount = BankAccount {
        accountNo: parsed_payload.accountNo,
        ifscCode: parsed_payload.ifscCode,
        contactNo: parsed_payload.accountHolderContactNo,
        mmid: parsed_payload.mmid,
    };

    save_benificary(&parsed_payload.txnId, &benificary, redis_con).await;

    let saved_state: IMPSTransactionState = get_saved_state(&parsed_payload.txnId, redis_con).await;

    let new_key = "imps-transfer-debit-remitter";

    let bank_code = if saved_state.remitter.ifscCode.len() >= 3 {
        &saved_state.remitter.ifscCode[0..3]
    } else {
        "CMK"
    };

    let remitter_bank = BANKS.get_bank_by_code(bank_code);
    let prepaired_payload = json!({
        "remitterDetails": saved_state.remitter,
        "beneficiaryDetails": benificary,
        "txnId": saved_state.txn_id,
        "amount": saved_state.amount,
    });
    let stringify_payload = serde_json::to_string_pretty(&prepaired_payload).unwrap();
    forward_to_bank(
        &remitter_bank.nth_to_bank,
        new_key,
        &stringify_payload,
        producer,
    )
    .await;
}

async fn credit_beneficiary(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // println!("Credit beneficiary");
    let parsed_payload: Value = serde_json::from_str(payload).unwrap();
    let txnid = parsed_payload["txnId"]
        .as_str()
        .expect("txnId must be a string");

    let saved_state: IMPSTransactionState = get_saved_state(txnid, redis_con).await;

    let new_key = "imps-transfer-credit-beneficiary";
    let bank_code = if saved_state.benificary.ifscCode.len() >= 3 {
        &saved_state.benificary.ifscCode[0..3]
    } else {
        "CMK"
    };
    let benificary_bank = BANKS.get_bank_by_code(bank_code);
    let prepaired_payload = json!({
        "remitterDetails": saved_state.remitter,
        "beneficiaryDetails": saved_state.benificary,
        "txnId": saved_state.txn_id,
        "amount": saved_state.amount,
    });
    let stringify_payload = serde_json::to_string_pretty(&prepaired_payload).unwrap();
    forward_to_bank(
        &benificary_bank.nth_to_bank,
        new_key,
        &stringify_payload,
        producer,
    )
    .await;
}

async fn transaction_complete(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // println!("Transaction complete");
    let parsed_payload: Value = serde_json::from_str(payload).unwrap();
    let txnid = parsed_payload["txnId"]
        .as_str()
        .expect("txnId must be a string");

    let saved_state: IMPSTransactionState = get_saved_state(txnid, redis_con).await;

    let new_key = "imps-transfer-complete";
    let bank_code = if saved_state.remitter.ifscCode.len() >= 3 {
        &saved_state.remitter.ifscCode[0..3]
    } else {
        "CMK"
    };
    let remitter_bank = BANKS.get_bank_by_code(bank_code);
    forward_to_bank(&remitter_bank.nth_to_bank, new_key, payload, producer).await;
}
