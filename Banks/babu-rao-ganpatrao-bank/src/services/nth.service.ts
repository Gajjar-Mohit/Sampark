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
          details.requestedBy,
          details.txnId
        );
        if (!account) {
          await sendNotFoundResponseToNTH();
          return;
        }
        await sendResponseToNTH(JSON.stringify(account));
        return;
      }
      if (key.includes("account-details")) {
        // console.log("Account details received");
        await sendResponseToNTH(value);
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

async function debitRequest(details: any) {
  //TODO: debit from the account
  console.log("Details received for debit: ", details);
  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending response to nth");
  await producer.send({
    topic: "654321-to-NTH",
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
    topic: "654321-to-NTH",
    messages: [
      {
        key: "imps-transfer-credit-benificiary-success",
        value: details,
      },
    ],
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
        value: accountDetails,
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

export async function initiateIMPSTransfer(details: any) {
  const producer = kafka.producer();
  console.log("Connecting 654321-to-NTH");
  await producer.connect();
  console.log("654321-to-NTH Connected Successfully");
  await producer.send({
    topic: "654321-to-NTH",
    messages: [
      {
        key: "imps-transfer",
        value: JSON.stringify(details),
      },
    ],
  });
}
