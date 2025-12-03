use crate::{types::payload::AddBankAccount, utils::parser::parse_upi_add_account_payload};

pub async fn process_upi_add_account_request(topic: &str, payload: &str) {
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

pub async fn process_upi_transfer_request(topic: &str, payload: &str) {
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
