import { kafka } from "..";
import { registeredBanks } from "../core/registered-banks";

export async function createConnections() {
  const admin = kafka.admin();

  try {
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin Connection Success...");

    registeredBanks.forEach(async (bank) => {
      const iin1 = bank.iin + "-to-NTH";
      const iin2 = "NTH-to-" + bank.iin;
      console.log("Creating channel for bank ", bank.name, iin1, iin2);
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

const arr = [
  "456123-to-NTH",
  "NTH-to-321987",
  "654321-to-NTH",
  "321987-to-NTH",
  "NTH-to-654321",
  "789456-to-NTH",
  "NTH-to-789456",
  "NTH-to-456123",
];

// Creating channel for bank  Chinta Mat Karo Bank 456123-to-NTH NTH-to-456123
// Creating channel for bank  Chai Pani Bank 789456-to-NTH NTH-to-789456
// Creating channel for bank  Paisa Vasool Bank 321987-to-NTH NTH-to-321987
// Creating channel for bank  Babu Rao Ganpatrao Bank 654321-to-NTH NTH-to-654321
