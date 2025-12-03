use std::thread::panicking;

use serde_json::json;

use crate::{
    config::banks::BANKS,
    core::producer::forward_to_bank,
    types::payload::{self, Payload},
    utils::{imps_flow::imps_flow, parser::parse_imps_payload},
};

pub async fn process_imps_request(topic: &str, key: &str, payload: &str) {
    println!("--------------------------------------------------");
    println!("Processing IMPS Request");
    println!("Topic: {}", topic);
    let parsed_payload: Payload = parse_imps_payload(payload);
    println!("TxnId: {}", parsed_payload.txnId);
    println!("amount: {}", parsed_payload.amount);
    println!(
        "Remitter AccountNo: {} \nRemitter ContactNo: {} \nRemitter IFSCCODE: {} \nRemitter MMID: {}",
        parsed_payload.remitterDetails.accountNo,
        parsed_payload.remitterDetails.contactNo,
        parsed_payload.remitterDetails.ifscCode,
        parsed_payload.remitterDetails.mmid
    );
    println!(
        "Beneficiary AccountNo: {}\nBeneficiary ContactNo: {}\nBeneficiary IFSCCODE: {}\nBeneficiary MMID: {}",
        parsed_payload.beneficiaryDetails.accountNo,
        parsed_payload.beneficiaryDetails.contactNo,
        parsed_payload.beneficiaryDetails.ifscCode,
        parsed_payload.beneficiaryDetails.mmid
    );
    println!("--------------------------------------------------");
    for state in imps_flow.iter() {
        if state.key == key {
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
    println!("Getting in");
    if payload.beneficiaryDetails.accountNo.is_empty() && payload.beneficiaryDetails.mmid.is_empty()
    {
        let error_value = "Missing account no or mmid";
        // forward to bank
        print!("{}", error_value);
        forward_to_bank(topic, error_key, error_value).await;
        return;
    }

    if payload.amount.is_empty() {
        let error_value = "Missing amount";
        print!("{}", error_value);
        // forward to bank
        forward_to_bank(topic, error_key, error_value).await;
        return;
    }

    if !payload.beneficiaryDetails.accountNo.is_empty()
        && !payload.beneficiaryDetails.ifscCode.is_empty()
    {
        let key = "imps-transfer-verify-details";
        let bank_code = &payload.beneficiaryDetails.ifscCode[0..3];
        let bank = BANKS.get_bank_by_code(bank_code);
        println!("Bank Name: {}", bank.name);
        println!("Bank IIN: {}", bank.iin);

        let prepared_payload = json!({
            "ifscCode": payload.beneficiaryDetails.ifscCode,
            "accountNo": payload.beneficiaryDetails.accountNo,
            "replyTo": bank.bank_to_nth,
            "txnId": payload.txnId
        });
        let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();
        println!("Payload: {}", stringify_payload);
        forward_to_bank(&bank.nth_to_bank, key, &stringify_payload).await;
    } else {
        let error_value = "Missing accountno or ifsc code";
        // forward to bank
        forward_to_bank(topic, error_key, error_value).await;
        return;
    }
}

async fn debit_remitter(topic: &str, key: &str, payload: &str) {}

async fn credit_beneficiary(topic: &str, key: &str, payload: &str) {}

async fn transaction_complete(topic: &str, key: &str, payload: &str) {}
