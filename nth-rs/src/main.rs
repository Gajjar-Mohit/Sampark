#![allow(warnings)]
mod config;
mod core;
mod types;
mod utils;

use crate::core::producer;
use crate::core::{admin, consumer};

#[tokio::main]
async fn main() {
    let producer = producer::create();

    let client = redis::Client::open("redis://redis-stack:6379/").expect("Invalid Redis URL");
    let redis_con = client
        .get_multiplexed_async_connection()
        .await
        .expect("Redis connect failed");

    
    admin::create_topic_if_not_exists().await;

    consumer::start_consumers(producer, redis_con).await;
}
