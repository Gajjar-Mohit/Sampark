use crate::core::structs::{self, Transaction};
use rdkafka::{
    ClientConfig,
    producer::{FutureProducer, FutureRecord},
    util::Timeout,
};
use std::{env, time::Duration};

pub fn create() -> FutureProducer {
    let mut config = ClientConfig::new();
    let kafka_brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".to_string());
    config.set("bootstrap.servers", &kafka_brokers);
    let producer: FutureProducer = config.create().expect("Failure in creating producer");
    producer
}

pub async fn produce(transaction: structs::Transaction) {
    let record = FutureRecord::to(transaction.topic.as_str())
        .payload(transaction.data.as_str())
        .key(transaction.key.as_str());

    let status_delivery = transaction
        .future_producer
        .send(record, Timeout::After(Duration::from_secs(2)))
        .await;

    match status_delivery {
        Ok(report) => println!("Message sent: {:?}", report),
        Err(e) => println!("Error in producing.. {:?}", e),
    }
}

pub async fn forward_to_bank(topic: &str, key: &str, payload: &str) {
    println!("Inside forwarding");
    let future_producer = create();
    let record = FutureRecord::to(topic).payload(payload).key(key);

    let status_delivery = future_producer
        .send(record, Timeout::After((Duration::from_secs(2))))
        .await;

    match status_delivery {
        Ok(report) => println!("Message sent: {:?}", report),
        Err(e) => println!("Error in producing.. {:?}", e),
    }
    return;
}
