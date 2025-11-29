use std::time::Duration;

use crate::config::banks::{BANKS, Bank};
use rdkafka::{
    ClientConfig, Message,
    consumer::{CommitMode, Consumer, StreamConsumer},
};

async fn consume_banks(bank: Bank) {
    let consumer: StreamConsumer = listern_from_banks(bank.clone());
    consume(consumer, bank.nth_to_bank.clone()).await;
}

pub async fn start_consumers() {
    print!("Starting all bank consumers.\n");
    tokio::join!(
        consume_banks(BANKS.cmk.clone()),
        consume_banks(BANKS.cpb.clone()),
        consume_banks(BANKS.pvb.clone()),
        consume_banks(BANKS.brg.clone())
    );
}

fn listern_from_banks(bank: Bank) -> StreamConsumer {
    let mut config = ClientConfig::new();

    config
        .set("bootstrap.servers", "localhost:9092")
        .set("auto.offset.reset", "earliest")
        .set("group.id", bank.bank_to_nth_group)
        .set("socket.timeout.ms", "4000");

    let consumer: StreamConsumer = config.create().expect("Fail to create consumer");

    consumer
}

async fn consume(consumer: StreamConsumer, topic: String) {
    consumer
        .subscribe(&[topic.as_str()])
        .expect("Can't subscribe");

    match consumer.fetch_metadata(None, Duration::from_secs(5)) {
        Ok(metadata) => {
            println!("Topic: {}", topic.as_str());
            println!("Brokers: {}", metadata.brokers().len());
        }
        Err(e) => {
            println!("Errors: {}", e)
        }
    }

    loop {
        match consumer.recv().await {
            Err(e) => println!("{:?}", e),
            Ok(message) => {
                match message.payload_view::<str>() {
                    None => println!("No Message"),
                    Some(Ok(msg)) => println!("Message Recieved in {}: {}", topic.as_str(), msg),
                    Some(Err(e)) => println!("Error Parsing: {}", e),
                }
                consumer
                    .commit_message(&message, CommitMode::Async)
                    .unwrap();
            }
        }
    }
}
