import { Kafka } from "kafkajs";
import { listenForRequests } from "./ingress/verify-details";

if (!process.env.KAFKA_BASEURL) {
  throw new Error("KAFKA_BASEURL is not set");
}

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: [process.env.KAFKA_BASEURL],
});

// await createConnections()

// async function sendResponseToNTH() {
//   const res = await forwardToBanks("NTH-to-321987", "BRG15602800", "2342344562");
//   console.log(res);
// }

// sendResponseToNTH();
listenForRequests();
