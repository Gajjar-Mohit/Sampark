use redis::{Client, Commands};

pub fn sync_connection() {
    let mut client =
        Client::open("redis://127.0.0.1:6379/").expect("Unable to connect redis server");

    let _: () = client
        .set("key", "This is the thing")
        .expect("Unable to store the value");

    let value: String = client.get("key").expect("Unable to get the value");

    println!("Connection was success: {}", value)
}
