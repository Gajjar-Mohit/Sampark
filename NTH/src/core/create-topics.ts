import { kafka } from "..";
import { registeredBanks } from "../core/registered-banks";

export async function createConnections() {
  const admin = kafka.admin();

  try {
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin Connection Success...");
    // const topics = await admin.listTopics();
    // console.log(topics);
    //  await admin.deleteTopics({
    //    topics,
    //  });
    registeredBanks.forEach(async (bank) => {
      const iin1 = bank.iin + "-to-NTH";
      const iin2 = "NTH-to-" + bank.iin;
      console.log("Creating channel for bank ", bank.name, iin1, iin2);
      // await admin.createTopics({ topics: [{ topic: bank.iin }] });

      await admin.createTopics({
        topics: [
          {
            topic: iin1,
          },
          {
            topic: iin2,
          },
        ],
      });
    });

    console.log("Channels Created Successfully");
  } catch (error) {
    console.error("Error during Kafka admin operations:", error);
  }
}