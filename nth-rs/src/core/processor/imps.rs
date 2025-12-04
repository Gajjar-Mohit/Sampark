use std::{ptr::null, thread::panicking};

use serde_json::{Value, json};

use crate::{
    config::banks::BANKS,
    core::{
        producer::forward_to_bank,
        state_manager::{get_saved_state, save_benificary, save_intermidiate_step, save_remitter},
    },
    types::payload::{self, BankAccount, Payload, TransactionState},
    utils::{
        imps_flow::imps_flow,
        parser::{parse_imps_payload, parse_verified_beneficary},
    },
};

pub async fn process_imps_request(topic: &str, key: &str, payload: &str) {
    println!("--------------------------------------------------");
    println!("Processing IMPS Request");
    println!("Topic: {}", topic);
    println!("Key; {}", key);

    // println!("TxnId: {}", parsed_payload.txnId);
    // println!("amount: {}", parsed_payload.amount);
    // println!(
    //     "Remitter AccountNo: {} \nRemitter ContactNo: {} \nRemitter IFSCCODE: {} \nRemitter MMID: {}",
    //     parsed_payload.remitterDetails.accountNo,
    //     parsed_payload.remitterDetails.contactNo,
    //     parsed_payload.remitterDetails.ifscCode,
    //     parsed_payload.remitterDetails.mmid
    // );
    // println!(
    //     "Beneficiary AccountNo: {}\nBeneficiary ContactNo: {}\nBeneficiary IFSCCODE: {}\nBeneficiary MMID: {}",
    //     parsed_payload.beneficiaryDetails.accountNo,
    //     parsed_payload.beneficiaryDetails.contactNo,
    //     parsed_payload.beneficiaryDetails.ifscCode,
    //     parsed_payload.beneficiaryDetails.mmid
    // );
    println!("--------------------------------------------------");
    for state in imps_flow.iter() {
        if state.key == key {
            let txn_id: serde_json::Value =
                serde_json::from_str(payload).expect("Failed to parse txnid");
            save_intermidiate_step(
                txn_id["txnId"].as_str().unwrap_or_default(),
                &state.step,
                topic,
            );

            if key == "imps-transfer" {
                verify_bank_details(topic, key, payload).await;
            } else if key == "imps-transfer-error" {
                forward_to_bank(topic, key, payload).await;
            } else if key == "imps-transfer-verified-details" {
                debit_remitter(topic, key, payload).await;
            } else if key == "imps-transfer-debit-remitter-success" {
                credit_beneficiary(topic, key, payload).await;
            } else if key == "imps-transfer-credit-benificiary-success" {
                transaction_complete(topic, key, payload).await;
            }
        }
    }
}

async fn verify_bank_details(topic: &str, key: &str, payload: &str) {
    let payload: Payload = parse_imps_payload(payload);
    let error_key = "imps-transfer-error";

    if payload.beneficiaryDetails.accountNo.is_empty() && payload.beneficiaryDetails.mmid.is_empty()
    {
        let error_value = "Missing account no or mmid";
        print!("{}", error_value);
        forward_to_bank(topic, error_key, error_value).await;
    }

    if payload.amount.is_empty() {
        let error_value = "Missing amount";
        print!("{}", error_value);
        forward_to_bank(topic, error_key, error_value).await;
    }

    if !payload.beneficiaryDetails.accountNo.is_empty()
        && !payload.beneficiaryDetails.ifscCode.is_empty()
    {
        save_remitter(
            &payload.txnId,
            payload.amount.parse().unwrap(),
            &payload.remitterDetails,
        );

        let key = "imps-transfer-verify-details";
        let bank_code = &payload.beneficiaryDetails.ifscCode[0..3];
        let bank = BANKS.get_bank_by_code(bank_code);
        // println!("Bank Name: {}", bank.name);
        // println!("Bank IIN: {}", bank.iin);

        let prepared_payload = json!({
            "ifscCode": payload.beneficiaryDetails.ifscCode,
            "accountNo": payload.beneficiaryDetails.accountNo,
            "replyTo": bank.bank_to_nth,
            "txnId": payload.txnId
        });
        let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();
        // println!("Payload: {}", stringify_payload);
        forward_to_bank(&bank.nth_to_bank, key, &stringify_payload).await;
    } else {
        let error_value = "Missing accountno or ifsc code";
        // forward to bank
        forward_to_bank(topic, error_key, error_value).await;
    }
}

async fn debit_remitter(topic: &str, key: &str, payload: &str) {
    println!("Debitting remitter");
    let parsed_payload = parse_verified_beneficary(payload);
    let benificary: BankAccount = BankAccount {
        accountNo: parsed_payload.accountNo,
        ifscCode: parsed_payload.ifscCode,
        contactNo: parsed_payload.accountHolderContactNo,
        mmid: parsed_payload.mmid,
    };
    save_benificary(&parsed_payload.txnId, &benificary);
    let saved_state: TransactionState = get_saved_state(&parsed_payload.txnId);
    let new_key = "imps-transfer-debit-remitter";
    let remitter_bank = BANKS.get_bank_by_code(&saved_state.remitter.ifscCode[0..3]);
    let prepaired_payload = json!({
        "remitterDetails": saved_state.remitter,
          "beneficiaryDetails": benificary,
          "txnId": saved_state.txn_id,
          "amount": saved_state.amount,
    });
    let stringify_payload = serde_json::to_string_pretty(&prepaired_payload).unwrap();
    forward_to_bank(&remitter_bank.nth_to_bank, new_key, &stringify_payload).await;
}

async fn credit_beneficiary(topic: &str, key: &str, payload: &str) {
    println!("Credit beneficiary");
    let parsed_payload: Value = serde_json::from_str(&payload).unwrap();
    let txnid = parsed_payload["txnId"]
        .as_str()
        .expect("txnId must be a string");
    let saved_state: TransactionState = get_saved_state(txnid);
    let new_key = "imps-transfer-credit-beneficiary";
    let benificary_bank = BANKS.get_bank_by_code(&saved_state.benificary.ifscCode[0..3]);
    let prepaired_payload = json!({
        "remitterDetails": saved_state.remitter,
          "beneficiaryDetails": saved_state.benificary,
          "txnId": saved_state.txn_id,
          "amount": saved_state.amount,
    });
    let stringify_payload = serde_json::to_string_pretty(&prepaired_payload).unwrap();
    // println!("Payload: {}", stringify_payload);
    forward_to_bank(&benificary_bank.nth_to_bank, new_key, &stringify_payload).await;
}

async fn transaction_complete(topic: &str, key: &str, payload: &str) {
    println!("Transaction complete");
    let parsed_payload: Value = serde_json::from_str(&payload).unwrap();
    let txnid = parsed_payload["txnId"]
        .as_str()
        .expect("txnId must be a string");
    let saved_state: TransactionState = get_saved_state(txnid);
    let new_key = "imps-transfer-complete";
    let remitter_bank = BANKS.get_bank_by_code(&saved_state.remitter.ifscCode[0..3]);
    forward_to_bank(&remitter_bank.nth_to_bank, new_key, &payload).await;
}
