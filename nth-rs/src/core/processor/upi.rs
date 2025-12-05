use rdkafka::producer::FutureProducer;
use redis::aio::MultiplexedConnection;

use crate::{
    config::banks::BANKS, core::producer::forward_to_bank, types::payload::{AddBankAccount, VerifiedBankAccount, VerifiedUpiBankAccount},
    utils::parser::{parse_upi_account_added_payload, parse_upi_add_account_payload},
};

pub async fn process_upi_request(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    if key == "upi-add-bank-details" {
        add_bank_account(topic, key, payload, producer, redis_con).await;
    } else if key == "upi-bank-details-added" {
        add_bank_account_added(topic, key, payload, producer, redis_con).await;
    }
}

async fn add_bank_account(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    println!("--------------------------------------------------");
    println!("Processing UPI Add Account Request");
    println!("Topic: {}", topic);
    println!("Payload: {}", payload);
    let parsed_payload: AddBankAccount = parse_upi_add_account_payload(payload);
    println!("Parsed payload");
    println!("TxnId: {}", parsed_payload.txnId);
    println!("--------------------------------------------------");

    if parsed_payload.contactNo.is_empty()
        || parsed_payload.ifscCode.is_empty()
        || parsed_payload.txnId.is_empty()
    {
        println!("Somthing is missing in the parsed payload")
    }

    let bank = BANKS.get_bank_by_code(&parsed_payload.ifscCode[0..3]);

    forward_to_bank(&bank.nth_to_bank, key, payload, producer).await;
}

async fn add_bank_account_added(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    println!("--------------------------------------------------");
    println!("Processing UPI Add Account Request");
    println!("Topic: {}", topic);
    println!("Payload: {}", payload);
    let parsed_payload: VerifiedUpiBankAccount = parse_upi_account_added_payload(payload);
    println!("Parsed payload");
    println!("TxnId: {}", parsed_payload.txnId);
    forward_to_bank(&parsed_payload.requestedBy, key, payload, producer).await;
}
