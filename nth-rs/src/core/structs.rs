use rdkafka::producer::FutureProducer;

pub struct Transaction {
    pub future_producer: FutureProducer,
    pub key: String,
    pub topic: String,
    pub data: String,
}
