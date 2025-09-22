import { Kafka } from "kafkajs";
import { listenForRequests } from "./ingress/listern-from-banks";
import { createClient } from "redis";
import client from "prom-client";
import express from "express";
import cors from "cors";

const PORT = parseInt(process.env.PORT || "3000", 10);

if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

const config = {
  kafka: {
    clientId: "nth-switch",
    brokers: [process.env.KAFKA_BASEURL],
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_DB || "0", 10),
  },
};

export const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

async function createRedisClient() {
  const client = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.database,
  });

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  client.on("connect", () => {
    console.log("Redis client connected");
  });

  client.on("disconnect", () => {
    console.log("Redis client disconnected");
  });

  await client.connect();
  return client;
}

export const redisClient = await createRedisClient();

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

async function startServer() {
  try {
    listenForRequests();

    app.listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
