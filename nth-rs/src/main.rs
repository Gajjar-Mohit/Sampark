mod config;
mod core;

use crate::core::{admin, consumer};

#[tokio::main]
async fn main() {
    admin::create_topic_if_not_exists().await;
    consumer::start_consumers().await;
}
