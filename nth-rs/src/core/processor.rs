use std::iter::Map;

use crate::{
    types::payload::{AddBankAccount, Payload},
    utils::parser::{parse_imps_payload, parse_upi_add_account_payload},
};

pub fn process_imcomming_request(topic: &str, key: Option<&str>, payload: &str) {
    match key {
        Some("imps-transfer") => process_imps_request(topic, payload),
        Some("upi-add-bank-details") => process_upi_add_account_request(topic, payload),
        _ => (),
    }
}

fn process_imps_request(topic: &str, payload: &str) {
    println!("--------------------------------------------------");
    println!("Processing IMPS Request");
    println!("Topic: {}", topic);
    let parsed_payload: Payload = parse_imps_payload(payload);
    println!("Parsed payload");
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
}

fn process_upi_add_account_request(topic: &str, payload: &str) {
    println!("--------------------------------------------------");
    println!("Processing UPI Add Account Request");
    println!("Topic: {}", topic);
    let parsed_payload: AddBankAccount = parse_upi_add_account_payload(payload);
    println!("Parsed payload");
    println!("TxnId: {}", parsed_payload.txnId);
    println!(
        "ContactNo: {}\n IFSCCODE: {}\n RequestedBy: {}",
        parsed_payload.contactNo, parsed_payload.ifscCode, parsed_payload.requestedBy
    );
    println!("--------------------------------------------------");
}

fn process_upi_transfer_request(topic: &str, payload: &str) {
    println!("--------------------------------------------------");
    println!("Processing UPI Request");
    println!("Topic: {}", topic);
    let parsed_payload: AddBankAccount = parse_upi_add_account_payload(payload);
    println!("Parsed payload");
    println!("TxnId: {}", parsed_payload.txnId);
    println!(
        "ContactNo: {}\n IFSCCODE: {}\n RequestedBy: {}",
        parsed_payload.contactNo, parsed_payload.ifscCode, parsed_payload.requestedBy
    );
    println!("--------------------------------------------------");
}
