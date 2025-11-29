use crate::core::structs;
use rdkafka::{
    ClientConfig,
    producer::{FutureProducer, FutureRecord},
    util::Timeout,
};
use std::time::Duration;

pub fn create() -> FutureProducer {
    let mut config = ClientConfig::new();
    config.set("bootstrap.servers", "localhost:9092");
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
