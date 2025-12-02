use std::env;
use std::time::Duration;

use crate::{
    config::banks::{BANKS, Bank},
    core::processor::process_imcomming_request,
};
use rdkafka::{
    ClientConfig, Message,
    consumer::{CommitMode, Consumer, StreamConsumer},
};

async fn consume_banks(bank: Bank) {
    let consumer: StreamConsumer = listern_from_banks(bank.clone());
    consume(consumer, bank.bank_to_nth.clone()).await;
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

    // Use environment variable, default to localhost for local dev
    let kafka_brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".to_string());

    config
        .set("bootstrap.servers", &kafka_brokers)
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
                let key = match message.key_view::<str>() {
                    None => None,
                    Some(Ok(k)) => Some(k),
                    Some(Err(e)) => {
                        println!("Error parsing key: {}", e);
                        None
                    }
                };

                 let value = match message.payload_view::<str>() {
                    None => {
                        println!("No Message");
                        None
                    }
                    Some(Ok(msg)) => Some(msg),
                    Some(Err(e)) => {
                        println!("Error Parsing value: {}", e);
                        None
                    }
                };

                if let Some(v) = value {
                    process_imcomming_request(topic.as_str(), key, v);
                }

                consumer
                    .commit_message(&message, CommitMode::Async)
                    .unwrap();
            }
        }
    }
}
