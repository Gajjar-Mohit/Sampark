import { kafka } from "..";
import { getAccountByContactNo } from "./account.service";
import { creditBankAccount, debitBankAccount } from "./imps.service";
import { storeTransaction } from "./transaction.service";

export async function listernForNTH() {
  const consumer = kafka.consumer({ groupId: "NTH-to-321987-group" });
  await consumer.connect();

  await consumer.subscribe({
    topics: ["NTH-to-321987"],
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

      if (key==="imps-transfer-verify-details") {
        console.log("Verify details received");
        const details = JSON.parse(value);
        const account = await getAccountByContactNo(
          details.accountNo,
          details.ifscCode,
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
      if (message.key?.toString() === "imps-transfer-debit-remitter") {
        await debitRequest(message.value?.toString() || "");
        return;
      }
      if (
        message.key?.toString() === "imps-transfer-credit-beneficiary"
      ) {
        await creditRequest(message.value?.toString() || "");
        return;
      }
    },
  });
}

async function debitRequest(details: any) {
  console.log("Details received for debit: ", details);
  const data = JSON.parse(details);
  const { remitterDetails, beneficiaryDetails } = data;
  const { accountNo, ifscCode, contactNo } = remitterDetails;
  const amount = Number.parseFloat(remitterDetails.amount);
  const result = await debitBankAccount(accountNo, ifscCode, contactNo, amount);
  const txSaveed = await storeTransaction(
    data.txnId,
    amount,
    "DEBIT",
    remitterDetails.accountNo,
    "IMPS/" + beneficiaryDetails.accountNo
  );
  console.log("Transaction saved: ", txSaveed);
  if (!result.success) {
    console.error("Error debiting bank account:" + result);
    return;
  }
  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending response to nth");
  await producer.send({
    topic: "321987-to-NTH",
    messages: [
      {
        key: "imps-transfer-debit-remitter-success",
        value: details,
      },
    ],
  });
}

async function creditRequest(details: any) {
  console.log("Details received for credit: ", details);
  const data = JSON.parse(details);
  console.log(data);
  const { remitterDetails, beneficiaryDetails } = data;
  const { accountNo, ifscCode, contactNo } = beneficiaryDetails;
  const amount = Number.parseFloat(remitterDetails.amount);
  const result = await creditBankAccount(
    accountNo,
    ifscCode,
    contactNo,
    amount
  );
  const txSaveed = await storeTransaction(
    data.txnId,
    amount,
    "CREDIT",
    remitterDetails.accountNo,
    "IMPS/" + beneficiaryDetails.accountNo
  );
  console.log("Transaction saved: ", txSaveed);
  if (!result.success) {
    console.error("Error debiting bank account:" + result);
    return;
  }
  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending response to nth");
  await producer.send({
    topic: "321987-to-NTH",
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
  console.log("Connecting 321987-to-NTH");
  await producer.connect();
  console.log("Sending response to NTH");
  await producer.send({
    topic: "321987-to-NTH",
    messages: [
      {
        key: "imps-transfer-verified-details",
        value: accountDetails,
      },
    ],
  });
}

async function sendNotFoundResponseToNTH() {
  const producer = kafka.producer();
  console.log("Connecting 321987-to-NTH");
  await producer.connect();
  console.log("321987-to-NTH Connected Successfully");
  await producer.send({
    topic: "321987-to-NTH",
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
  console.log("Connecting 321987-to-NTH");
  await producer.connect();
  console.log("321987-to-NTH Connected Successfully");
  await producer.send({
    topic: "321987-to-NTH",
    messages: [
      {
        key: "imps-transfer",
        value: JSON.stringify(details),
      },
    ],
  });
}
