use rdkafka::{
    ClientConfig, Message, consumer::{CommitMode, Consumer, StreamConsumer}
};

pub async fn start() {
    let consumer: StreamConsumer = create();
    consume(consumer).await;
}

fn create() -> StreamConsumer {
    let mut config = ClientConfig::new();

    config
        .set("bootstrap.servers", "localhost:9092")
        .set("auto.offset.reset", "earliest")
        .set("group.id", "group1")
        .set("socket.timeout.ms", "4000");
    let consumer: StreamConsumer = config.create().expect("Fail to create consumer");

    consumer
}

async fn consume(consumer: StreamConsumer) {
    consumer
        .subscribe(&["topic1", "topic2"])
        .expect("Can't subscribe");

        loop {
            match consumer.recv().await {
                Err(e)=> println!("{:?}", e),
                Ok(message)=>{
                    match message.payload_view::<str>() {
                        None=> println!("No Message"),
                        Some(Ok(msg))=> println!("Message Recieved: {}", msg),
                        Some(Err(e))=> println!("Error Parsing: {}", e)
                    }
                    consumer.commit_message(&message, CommitMode::Async).unwrap();
                }
            }
        }
}
