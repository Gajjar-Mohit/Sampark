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
      if (message.key?.toString().includes("imps-transfer-debit-remitter")) {
        await debitRequest(message.value?.toString() || "");
        return;
      }
      if (
        message.key?.toString().includes("imps-transfer-credit-beneficiary")
      ) {
        await creditRequest(message.value?.toString() || "");
        return;
      }
    },
  });
}

export async function verifyIMPSTransfer(details: string) {
  console.log("Details received: ", details);
  const data = JSON.parse(details);
  const { ifscCode, accountNo, txnId } = data;
  if (!ifscCode || !accountNo || !txnId) {
    await sendErrorResponseToNTH("Missing details");
    return;
  }

  const account = await getAccountByAccountNo(accountNo);
  if (!account) {
    await sendErrorResponseToNTH("Account not found");
    return;
  }
  await sendResponseToNTH(JSON.stringify({ ...account, txnId }));
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

async function debitRequest(details: any) {
  //debit from the account
  console.log("Details received for debit: ", details);
  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending response to nth");
  await producer.send({
    topic: "789456-to-NTH",
    messages: [
      {
        key: "imps-transfer-debit-remitter-success",
        value: details,
      },
    ],
  });
}

async function creditRequest(details: any) {
  //debit from the account
  console.log("Details received for credit: ", details);

  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending response to nth");
  await producer.send({
    topic: "789456-to-NTH",
    messages: [
      {
        key: "imps-transfer-credit-benificiary-success",
        value: details,
      },
    ],
  });
}
