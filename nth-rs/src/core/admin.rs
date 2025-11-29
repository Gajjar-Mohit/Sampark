use std::time::Duration;

use rdkafka::{
    ClientConfig,
    admin::{AdminClient, AdminOptions, NewTopic},
    client::{self, DefaultClientContext},
    config,
};

use crate::config::banks::BANKS;

pub async fn create_topic_if_not_exists() {
    let mut config = ClientConfig::new();

    config.set("bootstrap.servers", "localhost:9092");

    let admin: AdminClient<DefaultClientContext> = config.create().expect("Fail to create admin");

    let topic = vec![
        BANKS.cmk.nth_to_bank.as_str(),
        BANKS.brg.nth_to_bank.as_str(),
        BANKS.cpb.nth_to_bank.as_str(),
        BANKS.pvb.nth_to_bank.as_str(),
        BANKS.cmk.bank_to_nth.as_str(),
        BANKS.brg.bank_to_nth.as_str(),
        BANKS.cpb.bank_to_nth.as_str(),
        BANKS.pvb.bank_to_nth.as_str(),
    ];

    let new_topics: Vec<NewTopic> = topic
        .iter()
        .map(|topic| NewTopic::new(topic, 1, rdkafka::admin::TopicReplication::Fixed(1))).collect();

    let opts = AdminOptions::new().request_timeout(Some(Duration::from_secs(5)));

    match admin.create_topics(&new_topics, &opts).await{
        Ok(results)=>{
            for result in results{
                match result {
                    Ok(topic)=>println!("Created topic: {}", topic),
                    Err((topic, e))=>{
                        if e.to_string().contains("already exists"){
                            println!("Topic {} already exists", topic)
                        } else {
                            eprintln!("Failed to create topic: {}: {}", topic, e)
                        }
                    }
                }
            }
            
        }
        Err(e) => println!("Failed to create topics: {}", e)
    }
}
