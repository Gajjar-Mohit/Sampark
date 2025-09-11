import { Kafka } from "kafkajs";
import { listenForRequests } from "./ingress/verify-details";
import { createConnections } from "./admin/create-topics";
import Queue from "bull";

if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: [process.env.KAFKA_BASEURL],
});

const redisConfig = {
  host: "127.0.0.1",
  port: 6379,
};

export const redis = new Queue("imps-queue", {
  redis: redisConfig,
});

// await createConnections()

listenForRequests();
