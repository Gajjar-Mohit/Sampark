import { kafka } from "..";
import { registeredBanks } from "../core/registered-banks";
import { forwardToBanks as forwardToBank } from "../egress/forward-to-banks";

export async function listenForRequests() {
  try {
    // Create consumers for each bank's incoming messages
    const consumerPromises = registeredBanks.map((bank) =>
      listenFromBank(bank.bankToNTHGroup, bank.bankToNTH)
    );

    // Start all consumers concurrently
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
    // console.log(
    //   `Processing message - Topic: ${topic}, KEY: ${key}, VALUE: ${value}`
    // );

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

async function processIMPSTransfer(topic: string, key: string, value: string) {
  try {
    console.log(
      `Processing IMPS transfer message - Topic: ${topic}, KEY: ${key}, VALUE: ${value}`
    );

    if (key === "imps-transfer") {
      await verifyDetails(topic, key, value);
      return;
    }
    if (key.includes("imps-transfer-error")) {
      console.log("IMPS transfer error received");
      return;
    }

    if (key.includes("imps-transfer-verified-details")) {
      console.log("IMPS transfer verified details received");
      const res = JSON.parse(value);
      console.log("Details received: ", res);
      const beneficiaryBank = "";
      const remitterBank = "";

      //debit from remitter bank
      await forwardToBank(
        remitterBank,
        "imps-transfer-debit",
        JSON.stringify({
          amount: res.amount,
          accountNo: res.beneficiaryAccountNo,
          mobileobileNo: res.beneficiaryMobileNo,
          MMID: res.beneficiaryMMID,
          IFSCode: res.benificiaryIFSCode,
        })
      );

      //credit to beneficiary bank
      await forwardToBank(
        beneficiaryBank,
        "imps-transfer-credit",
        JSON.stringify({
          amount: res.amount,
          beneficiaryAccountNo: res.beneficiaryAccountNo,
          beneficiaryMobileNo: res.beneficiaryMobileNo,
          beneficiaryMMID: res.beneficiaryMMID,
          benificiaryIFSCode: res.benificiaryIFSCode,
        })
      );
      return;
    }
  } catch (error) {
    console.error(`Error processing message for topic ${topic}:`, error);
    throw error;
  }
}

async function verifyDetails(topic: string, key: string, value: string) {
  const data = JSON.parse(value);
  const amount = data.amount;
  const beneficiaryAccountNo = data.beneficiaryAccountNo;
  const beneficiaryMobileNo = data.beneficiaryMobileNo;
  const beneficiaryMMID = data.beneficiaryMMID;
  const benificiaryIFSCode = data.benificiaryIFSCode;

  if (!beneficiaryAccountNo && !beneficiaryMMID) {
    const key = "imps-transfer-error";
    const value = "Missing beneficiary details";
    await forwardToBank(topic, key, value);
    return;
  }

  if (!beneficiaryMobileNo) {
    const key = "imps-transfer-error";
    const value = "Missing beneficiary mobile number";
    await forwardToBank(topic, key, value);
    return;
  }

  if (!amount) {
    const key = "imps-transfer-error";
    const value = "Missing amount";
    await forwardToBank(topic, key, value);
    return;
  }

  if (beneficiaryAccountNo && benificiaryIFSCode) {
    console.log("Verifying details using Account no and IFSC code");
    const key = "imps-transfer-verify-details";
    const benificiaryBank = registeredBanks.find(
      (bank) => bank.ifscCodePrefix === benificiaryIFSCode.substring(0, 3)
    );

    console.log("Benificiary bank: " + benificiaryBank);

    if (!benificiaryBank) {
      const key = "imps-transfer-error";
      const value = "Benificiary bank not found";
      forwardToBank(topic, key, value);
      return;
    }

    const value = JSON.stringify({
      ifscCode: benificiaryIFSCode,
      accountNo: beneficiaryAccountNo,
      replyTo: benificiaryBank.bankToNTH,
    });

    await forwardToBank(benificiaryBank.nthToBank, key, value);
  } else if (beneficiaryMMID) {
    console.log("Verifying details using MMID");
    const key = "imps-transfer-verify-details";

    const benificiaryBank = registeredBanks.find(
      (bank) => bank.mmidPrefix === beneficiaryMMID.substring(0, 4)
    );

    if (!benificiaryBank) {
      const key = "imps-transfer-error";
      const value = "Benificiary bank not found";
      forwardToBank(topic, key, value);
      return;
    }

    const value = JSON.stringify({
      ifscCode: benificiaryIFSCode,
      accountNo: beneficiaryMMID,
      replyTo: benificiaryBank.bankToNTH,
    });

    await forwardToBank(benificiaryBank.nthToBank, key, value);
  } else {
    const key = "imps-transfer-error";
    const value = "Missing beneficiary details";
    await forwardToBank(topic, key, value);
  }
}
