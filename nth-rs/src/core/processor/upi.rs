use rdkafka::producer::FutureProducer;
use redis::aio::MultiplexedConnection;
use serde_json::json;

use crate::{
    config::banks::BANKS,
    core::{
        producer::forward_to_bank,
        state_manager::upi_state_manager::{
            get_upi_saved_state, get_upi_saved_state_without_banks, save_reciever_bank_account,
            save_sender_bank_account, save_upi_intermidiate_step, save_upi_transfer_details,
        },
    },
    types::payload::{
        AddBankAccount, DebitRemitterPayload, InitUpiPayload, State, UpiTransactionState,
        UpiTransactionStateWithoutBanks, VerifiedBankAccount, VerifiedUpiBankAccount, VerifiedVpa,
    },
    utils::{
        parser::{
            parse_debit_remitter_payload, parse_upi_account_added_payload,
            parse_upi_add_account_payload, parse_upi_init_payload, parse_verified_vpa_payload,
        },
        upi_flow::upi_flow,
    },
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
    } else {
        for state in upi_flow.iter() {
            if state.key == key {
                let txn_id_res: Result<serde_json::Value, _> = serde_json::from_str(payload);
                if let Ok(txn_json) = txn_id_res {
                    let txn_id_str = txn_json["txnId"].as_str().unwrap_or_default();
                    save_upi_intermidiate_step(redis_con, txn_id_str, &state.step, topic).await;
                }
                if key == "upi-init-push-transaction" {
                    verify_from_vpa(topic, key, payload, producer, redis_con).await;
                } else if key == "upi-verify-from-vpa-complete" {
                    verify_to_vpa(topic, key, payload, producer, redis_con).await;
                } else if key == "upi-verify-to-vpa-complete" {
                    debit_remitter(topic, key, payload, producer, redis_con).await;
                } else if key == "upi-debit-remitter-success" {
                    credit_beneficiary(topic, key, payload, producer, redis_con).await;
                } else if key == "upi-credit-beneficiary-success" {
                    transaction_complete(topic, key, payload, producer, redis_con).await;
                }
            }
        }
    }
}

async fn add_bank_account(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    let parsed_payload: AddBankAccount = parse_upi_add_account_payload(payload);
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
    let parsed_payload: VerifiedUpiBankAccount = parse_upi_account_added_payload(payload);
    forward_to_bank(&parsed_payload.requestedBy, key, payload, producer).await;
}

async fn verify_from_vpa(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    let parsed_payload: InitUpiPayload = parse_upi_init_payload(payload);

    let bank_code = parsed_payload
        .fromVpa
        .split("@")
        .nth(1)
        .unwrap_or("")
        .to_uppercase();
    let bank = BANKS.get_bank_by_code(&bank_code);

    let new_key = "upi-verify-from-vpa";

    let prepared_payload = json!({
        "txnId": parsed_payload.txnId,
        "toVpa": parsed_payload.toVpa,
        "fromVpa": parsed_payload.fromVpa
    });

    save_upi_transfer_details(parsed_payload, redis_con).await;
    let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();

    forward_to_bank(&bank.nth_to_bank, new_key, &stringify_payload, producer).await;
}

async fn verify_to_vpa(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    let parsed_payload: VerifiedVpa = parse_verified_vpa_payload(payload);

    let saved_state: UpiTransactionStateWithoutBanks =
        get_upi_saved_state_without_banks(&parsed_payload.txnId, redis_con).await;

    let bank_code = saved_state
        .toVpa
        .split("@")
        .nth(1)
        .unwrap_or("")
        .to_uppercase();
    let bank = BANKS.get_bank_by_code(&bank_code);

    let new_key = "upi-verify-to-vpa";

    let prepaired_payload = json!({
        "txnId": parsed_payload.txnId,
        "toVpa": saved_state.toVpa,
        "fromVpa": saved_state.fromVpa
    });

    let stringify_payload = serde_json::to_string_pretty(&prepaired_payload).unwrap();
    save_sender_bank_account(&parsed_payload.txnId, &parsed_payload, redis_con).await;
    forward_to_bank(&bank.nth_to_bank, new_key, &stringify_payload, producer).await;
}

async fn debit_remitter(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    let parsed_payload: VerifiedVpa = parse_verified_vpa_payload(payload);
    save_reciever_bank_account(&parsed_payload.txnId, &parsed_payload, redis_con).await;

    let saved_state = get_upi_saved_state(&parsed_payload.txnId, redis_con).await;

    let bank_code = &saved_state.senderBank.ifscCode[0..3];
    let bank = BANKS.get_bank_by_code(&bank_code);

    let prepared_payload = json!({
        "senderBank": saved_state.senderBank,
        "beneficiaryBank": saved_state.recieverBank,
        "txnId": saved_state.txnId,
        "amount": saved_state.amount
    });
    let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();
    let new_key = "upi-debit-remitter";
    forward_to_bank(&bank.nth_to_bank, new_key, &stringify_payload, producer).await
}

async fn credit_beneficiary(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // CMK(932066370130) → CPB(941466329718)
    // println!("Credit beneficiary");
    // println!("Payload: {}", payload);
    let parsed_payload: DebitRemitterPayload = parse_debit_remitter_payload(payload);
    // println!("Parsed Payload: {}", parsed_payload.accountNo);
    let saved_state = get_upi_saved_state(&parsed_payload.txnId, redis_con).await;
    let bank_code = &saved_state.recieverBank.ifscCode[0..3];

    let bank = BANKS.get_bank_by_code(&bank_code);

    let new_key = "upi-credit-beneficiary";
    let prepared_payload = json!({
        "senderBank": parsed_payload.senderBank,
        "beneficiaryBank": parsed_payload.beneficiaryBank,
        "txnId": parsed_payload.txnId,
        "amount": parsed_payload.amount
    });

    let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();

    forward_to_bank(&bank.nth_to_bank, new_key, &stringify_payload, producer).await;
}

async fn transaction_complete(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer,
    redis_con: &mut MultiplexedConnection,
) {
    // println!("Transaction Complete");
    // println!("Payload: {}", payload);

    let parsed_payload: DebitRemitterPayload = parse_debit_remitter_payload(payload);
    // println!("Parsed Payload: {}", parsed_payload.accountNo);

    let bank_code = parsed_payload
        .senderBank
        .vpa
        .split("@")
        .nth(1)
        .unwrap_or("")
        .to_uppercase();
    let bank = BANKS.get_bank_by_code(&bank_code);

    let prepared_payload = json!({
        "senderBank": parsed_payload.senderBank,
        "beneficiaryBank": parsed_payload.beneficiaryBank,
        "txnId": parsed_payload.txnId,
        "amount": parsed_payload.amount
    });

    let stringify_payload = serde_json::to_string_pretty(&prepared_payload).unwrap();
    let new_key = "upi-transaction-complete";
    forward_to_bank(&bank.nth_to_bank, new_key, &stringify_payload, producer).await
}
