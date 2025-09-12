import { Kafka } from "kafkajs";
import { listenForRequests } from "./ingress/listern-from-banks";
import { createClient } from "redis";

if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: [process.env.KAFKA_BASEURL],
});

const config = {
  kafka: {
    clientId: "nth-switch",
    brokers: [process.env.KAFKA_BASEURL || ""],
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
  },
};

async function createRedisClient() {
  const client = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db,
  });
  await client.connect();
  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  client.on("connect", () => {
    console.log("Redis client connected");
  });

  client.on("disconnect", () => {
    console.log("Redis client disconnected");
  });

  return client;
}
export const redisClient = await createRedisClient();

listenForRequests();
