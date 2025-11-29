use crate::core::{consumer, producer, structs};

mod core;

#[tokio::main]
async fn main() {
    let producer = core::producer::create();
    producer::produce(structs::Transaction {
        future_producer: producer,
        key: String::from("Key-1"),
        topic: String::from("topic1"),
        data: String::from("Test data"),
    })
    .await;

    consumer::start().await;
}
