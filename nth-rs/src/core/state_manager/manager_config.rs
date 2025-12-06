use redis::{AsyncCommands, RedisResult, aio::MultiplexedConnection};

pub async fn get(con: &mut MultiplexedConnection, key: &str) -> RedisResult<String> {
    con.get(key).await
}

pub async fn set(con: &mut MultiplexedConnection, key: &str, value: &str) {
    let _: () = con
        .set(key, value)
        .await
        .unwrap_or_else(|e| println!("Redis Set Error: {}", e));
}