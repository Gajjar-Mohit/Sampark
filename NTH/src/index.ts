import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "nth-switch",
  brokers: ["192.168.1.5:9092"],
  // Add connection timeout and retry settings
  connectionTimeout: 3000,
  requestTimeout: 25000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

async function init() {
  const admin = kafka.admin();

  try {
    console.log("Admin connecting...");
    await admin.connect(); // Add await here
    console.log("Admin Connection Success...");

    console.log("Creating Topic [verify-details]");
    await admin.createTopics({
      timeout: 30000, // Increase timeout
      waitForLeaders: true, // Wait for partition leaders
      topics: [
        {
          topic: "verify-detailsss",
          numPartitions: 2,
          replicationFactor: 1, // Add replication factor
        },
      ],
    });
    console.log("Topic Created Success [verify-details]");
  } catch (error) {
    console.error("Error during Kafka admin operations:", error);
  } finally {
    console.log("Disconnecting Admin..");
    await admin.disconnect();
  }
}

init().catch(console.error);
