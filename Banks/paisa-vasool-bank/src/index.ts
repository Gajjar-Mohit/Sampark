import express from "express";
import cors from "cors";
import { errorHandler } from "./utils/error_handler";
import router from "./routes";
import { Kafka } from "kafkajs";
import { listernForNTH } from "./services/nth.service";
import { createClient } from "redis";

const app = express();
if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: [process.env.KAFKA_BASEURL],
});

const config = {
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
  return client;
}

async function startServices() {
  try {
    console.log("Starting IMPS Kafka service...");
    await listernForNTH();
    console.log("IMPS Kafka service started successfully");
  } catch (error) {
    console.error("Failed to start IMPS Kafka service:", error);
    process.exit(1);
  }
}

const redisClient = await createRedisClient();

startServices();

const PORT = parseInt(process.env.PORT || "3000", 10);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.use(errorHandler);

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, redisClient };
