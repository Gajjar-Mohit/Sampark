use std::iter::Map;

use crate::{
    core::processor::{imps::process_imps_request, upi::process_upi_add_account_request}, types::payload::{AddBankAccount, Payload}, utils::parser::{parse_imps_payload, parse_upi_add_account_payload}
};

pub async fn process_imcomming_request(topic: &str, key: Option<&str>, payload: &str) {
    match key {
        Some(k) if k.contains("imps") => {
            process_imps_request(topic, key.unwrap(), payload).await;
        }
        Some(k) if k.contains("upi") => {
            process_upi_add_account_request(topic, payload);
        }
        _ => {}
    }
}
