import { kafka } from "..";
import { registeredBanks } from "../core/registered-banks";
import { processIMPSTransfer } from "../core/services/imps-state-manager";
import { forwardToBank } from "../egress/forward-to-banks";

export async function listenForRequests() {
  try {
    const consumerPromises = registeredBanks.map((bank) =>
      listenFromBank(bank.bankToNTHGroup, bank.bankToNTH)
    );
    await Promise.all(consumerPromises);
    console.log("All bank listeners started successfully");
  } catch (error) {
    console.error("Error starting bank listeners:", error);
    throw error;
  }
}

export async function listenFromBank(groupId: string, topicName: string) {
  console.log(
    `Starting listener for bank topic: ${topicName} with group: ${groupId}`
  );

  const consumer = kafka.consumer({ groupId });

  try {
    await consumer.connect();
    console.log(`Consumer connected for group: ${groupId}`);

    await consumer.subscribe({
      topics: [topicName],
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        try {
          const messageValue = message.value?.toString();
          const messageKey = message.key?.toString();

          if (!messageValue || !messageKey) {
            console.warn(`Empty message received from topic: ${topic}`);
            return;
          }

          await processIncomingMessage(topic, messageKey, messageValue);

          await heartbeat();
        } catch (messageError) {
          console.error(
            `Error processing message from topic ${topic}:`,
            messageError
          );
        }
      },
    });
  } catch (error) {
    console.error(`Error in listener for group ${groupId}:`, error);

    try {
      await consumer.disconnect();
    } catch (disconnectError) {
      console.error(
        `Error disconnecting consumer for group ${groupId}:`,
        disconnectError
      );
    }

    throw error;
  }
}

async function processIncomingMessage(
  topic: string,
  key: string,
  value: string
) {
  try {
    if (key.includes("imps-transfer")) {
      console.log("IMPS transfer details received");
      await processIMPSTransfer(topic, key, value);
      return;
    }

    if (key.includes("account-details")) {
      console.log("Account details received");
      const res = JSON.parse(value);
      await forwardToBank(res.accountDetails.requestedBy, key, value);
      return;
    }

    // Find which bank this message is from based on topic name
    const sourceBank = registeredBanks.find((bank) => bank.bankToNTH === topic);

    if (!sourceBank) {
      console.warn(`Unknown source bank for topic: ${topic}`);
      return;
    }

    const ifscCode = JSON.parse(value).ifscCode;
    const contactNo = JSON.parse(value).contactNo;
    const desticationBank = registeredBanks.find(
      (bank) => bank.ifscCodePrefix === ifscCode.substring(0, 3)
    );
    if (!desticationBank) {
      console.warn(`Unknown destination bank for ifscCode: ${key}`);
      return;
    }

    const verifyDetails = JSON.stringify({
      ifscCode,
      contactNo,
      requestedBy: sourceBank.nthToBank,
    });
    const res = await forwardToBank(
      desticationBank.nthToBank,
      "verify-details",
      verifyDetails
    );
    console.log(res);
    console.log(`Successfully processed message from ${sourceBank.name}`);
    console.log(`Successfully forwarded to ${desticationBank?.name}`);
  } catch (error) {
    console.error(`Error processing message for topic ${topic}:`, error);
    throw error;
  }
}
