import { kafka } from "..";

export async function listernForNTH() {
  const consumer = kafka.consumer({ groupId: "NTH-to-456123-group" });
  await consumer.connect();

  await consumer.subscribe({ topics: ["NTH-to-456123"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log(`[${topic}]: PART:${partition}:`, message.value?.toString());
    },
  });
}