use std::env;
use std::time::Duration;

use crate::{
    config::banks::{BANKS, Bank},
    core::processor::processor::process_imcomming_request,
};
use rdkafka::{
    ClientConfig, Message,
    consumer::{CommitMode, Consumer, StreamConsumer},
    producer::FutureProducer,
};
use redis::aio::MultiplexedConnection;

async fn consume_banks(bank: Bank, producer: FutureProducer, redis_con: MultiplexedConnection) {
    let consumer: StreamConsumer = listern_from_banks(bank.clone());
    consume(consumer, bank.bank_to_nth.clone(), producer, redis_con).await;
}

pub async fn start_consumers(producer: FutureProducer, redis_con: MultiplexedConnection) {
    print!("Starting all bank consumers.\n");
    tokio::join!(
        consume_banks(BANKS.cmk.clone(), producer.clone(), redis_con.clone()),
        consume_banks(BANKS.cpb.clone(), producer.clone(), redis_con.clone()),
        consume_banks(BANKS.pvb.clone(), producer.clone(), redis_con.clone()),
        consume_banks(BANKS.brg.clone(), producer.clone(), redis_con.clone())
    );
}

fn listern_from_banks(bank: Bank) -> StreamConsumer {
    let mut config = ClientConfig::new();

    
    let kafka_brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".to_string());

    config
        .set("bootstrap.servers", &kafka_brokers)
        .set("auto.offset.reset", "earliest")
        .set("group.id", bank.bank_to_nth_group)
        .set("socket.timeout.ms", "4000");

    let consumer: StreamConsumer = config.create().expect("Fail to create consumer");

    consumer
}

async fn consume(
    consumer: StreamConsumer,
    topic: String,
    producer: FutureProducer,
    mut redis_con: MultiplexedConnection,
) {
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
                    process_imcomming_request(
                        topic.as_str(),
                        key,
                        v,
                        producer.clone(),
                        redis_con.clone(),
                    )
                    .await;
                }

                consumer
                    .commit_message(&message, CommitMode::Async)
                    .unwrap();
            }
        }
    }
}
