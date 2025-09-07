import { kafka } from "..";
import { getAccountByContactNo } from "./account.service";

export async function listernForNTH() {
  const consumer = kafka.consumer({ groupId: "NTH-to-654321-group" });
  await consumer.connect();

  await consumer.subscribe({
    topics: ["NTH-to-654321"],
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const key = message.key?.toString() ?? "";
      const value = message.value?.toString() ?? "";
      if (!key || !value) {
        console.warn("Invalid message received");
        await sendNotFoundResponseToNTH();
        return;
      }
      console.log(key, value);

      if (key.includes("verify-details")) {
        console.log("Verify details received");
        const details = JSON.parse(value);
        const account = await getAccountByContactNo(
          details.contactNo,
          details.requestedBy
        );
        if (!account) {
          await sendNotFoundResponseToNTH();
          return;
        }
        await sendResponseToNTH(account);
        return;
      } else if (key.includes("account-details")) {
        // console.log("Account details received");
        await sendResponseToNTH(value);
        return;
      }
    },
  });
}
async function sendResponseToNTH(accountDetails: string) {
  const producer = kafka.producer();
  console.log("Connecting 654321-to-NTH");
  await producer.connect();
  console.log("654321-to-NTH Connected Successfully");
  await producer.send({
    topic: "654321-to-NTH",
    messages: [
      {
        key: "account-details",
        value: JSON.stringify({ accountDetails }),
      },
    ],
  });
}

async function sendNotFoundResponseToNTH() {
  const producer = kafka.producer();
  console.log("Connecting 654321-to-NTH");
  await producer.connect();
  console.log("654321-to-NTH Connected Successfully");
  await producer.send({
    topic: "654321-to-NTH",
    messages: [
      {
        key: "account-details",
        value: "Not Found",
      },
    ],
  });
}
