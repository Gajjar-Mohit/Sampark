import { kafka } from "..";
import { getAccount, getAccountByAccountNo } from "./account.service";

export async function listernForNTH() {
  const consumer = kafka.consumer({ groupId: "NTH-to-789456-group" });
  await consumer.connect();

  await consumer.subscribe({ topics: ["NTH-to-789456"] });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log(`[${topic}]: PART:${partition}:`, message.value?.toString());

      if (message.key?.toString().includes("imps-transfer-verify-details")) {
        await verifyIMPSTransfer(message.value?.toString() || "");
        return;
      }
    },
  });
}
// {"ifscCode":"CPB65674809","accountNo":"607623063293" "requestedBy":"NTH-to-789456"}
export async function verifyIMPSTransfer(details: string) {
  console.log("Details received: ", details);
  const data = JSON.parse(details);
  const { ifscCode, accountNo } = data;
  if (!ifscCode || !accountNo) {
    await sendErrorResponseToNTH("Missing details");
    return;
  }

  const account = await getAccountByAccountNo(accountNo);
  if (!account) {
    await sendErrorResponseToNTH("Account not found");
    return;
  }
  await sendResponseToNTH(JSON.stringify(account));
  return;
}

async function sendResponseToNTH(accountDetails: string) {
  const producer = kafka.producer();
  console.log("Connecting 789456-to-NTH");
  await producer.connect();
  console.log("Sending response to NTH");
  await producer.send({
    topic: "789456-to-NTH",
    messages: [
      {
        key: "imps-transfer-verified-details",
        value: accountDetails,
      },
    ],
  });
}

async function sendErrorResponseToNTH(error: string) {
  const producer = kafka.producer();
  console.log("Connecting 789456-to-NTH");
  await producer.connect();
  console.log("789456-to-NTH Connected Successfully");
  await producer.send({
    topic: "789456-to-NTH",
    messages: [
      {
        key: "imps-transfer-error",
        value: error,
      },
    ],
  });
}
