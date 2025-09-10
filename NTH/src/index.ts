import { Kafka } from "kafkajs";
import { listenForRequests } from "./ingress/verify-details";
import { createConnections } from "./admin/create-topics";

if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: [process.env.KAFKA_BASEURL],
});

// await createConnections()

listenForRequests();