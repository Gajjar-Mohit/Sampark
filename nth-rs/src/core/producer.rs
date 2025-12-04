use crate::core::structs::{self, Transaction};
use rdkafka::{
    ClientConfig,
    producer::{FutureProducer, FutureRecord},
    util::Timeout,
};
use redis::aio::MultiplexedConnection;
use std::{env, time::Duration};

pub fn create() -> FutureProducer {
    let mut config = ClientConfig::new();
    let kafka_brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".to_string());
    config.set("bootstrap.servers", &kafka_brokers);
    let producer: FutureProducer = config.create().expect("Failure in creating producer");
    producer
}

pub async fn forward_to_bank(
    topic: &str,
    key: &str,
    payload: &str,
    producer: &FutureProducer
) {
    println!("Inside forwarding");
    let record = FutureRecord::to(topic).payload(payload).key(key);

    let status_delivery = producer
        .send(record, Timeout::After((Duration::from_secs(2))))
        .await;

    match status_delivery {
        Ok(report) => println!("Message sent: {:?}", report),
        Err(e) => println!("Error in producing.. {:?}", e),
    }
    return;
}
