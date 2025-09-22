import { forwardToBank } from "../../egress/forward-to-banks";
import { addBankDetails } from "../processor/upi.processor";
import { registeredBanks } from "../registered-banks";
import {
  getTXState,
  saveBeneficiary,
  saveUpiTranferDetails,
  saveUPITransactionBeneficiaryDetails,
  saveUPITransactionSenderDetails,
} from "../services/logging.service";

export async function processUPITransfer(
  topic: string,
  key: string,
  value: string
) {
  console.log(`Processing UPI transfer message from topic: ${topic}`);
  console.log(value);
  console.log(`Processing UPI transfer message`);

  const data = JSON.parse(value);

  if (key === "upi-add-bank-details") {
    console.log("Adding bank details");
    await addBankDetails(topic, key, value);
  } else if (key === "upi-bank-details-added") {
    if (!data) {
      const key = "upi-error";
      const value = "Missing account details";
      await forwardToBank(topic, key, value);
      return;
    }

    await forwardToBank(data.requestedBy, key, value);
  } else if (key === "upi-init-push-transaction") {
    console.log(
      `Pushing transaction to bank for transaction: ${JSON.stringify(data)}`
    );
    if (!data) {
      const key = "upi-error";
      const value = "Missing account details";
      await forwardToBank(topic, key, value);
      return;
    }
    console.log("Pushing transaction to bank");
    console.log(data);

    const recipient = registeredBanks.find(
      (bank) =>
        bank.ifscCodePrefix.toUpperCase() ===
        data.toVpa.split("@")[1].toUpperCase()
    );

    //save the data to redis
    await saveUpiTranferDetails(data.txnId, {
      type: "UPI",
      ...data,
    });

    if (!recipient) {
      const key = "upi-error";
      const value = "Recipient bank not found";
      await forwardToBank(topic, key, value);
      return;
    }
    const key = "upi-verify-to-vpa";
    const value = JSON.stringify({
      txnId: data.txnId,
      toVpa: data.toVpa,
      fromVpa: data.fromVpa,
    });
    await forwardToBank(recipient.nthToBank, key, value);
  } else if (key === "upi-verify-to-vpa-complete") {
    console.log(
      `Verifying to VPA complete for transaction: ${JSON.stringify(data)}`
    );
    if (!data) {
      const key = "upi-error";
      const value = "Missing account details";
      await forwardToBank(topic, key, value);
      await saveUPITransactionBeneficiaryDetails(data.txnId, data);
      return;
    }
    const state = await getTXState(data.txnId);

    if (!state) {
      const key = "upi-error";
      const value = "Transaction state not found";
      await forwardToBank(topic, key, value);
      return;
    }

    console.log("Verifying to VPA complete");
    console.log(data);

    await saveBeneficiary(data.txnId, data);

    const sender = registeredBanks.find(
      (bank) =>
        bank.ifscCodePrefix.toUpperCase() ===
        state.data.fromVpa.split("@")[1].toUpperCase()
    );

    console.log(sender);

    if (!sender) {
      const key = "upi-error";
      const value = "Sender bank not found";
      await forwardToBank(topic, key, value);
      return;
    }

    const key1 = "upi-verify-from-vpa";
    const value1 = JSON.stringify({
      txnId: data.txnId,
      toVpa: state.datatoVpa,
      fromVpa: state.data.fromVpa,
    });
    await forwardToBank(sender.nthToBank, key1, value1);
  } else if (key === "upi-verify-from-vpa-complete") {
    console.log("Verify from VPA complete for transaction: " + data);
    console.log(data);
    await saveUPITransactionSenderDetails(data.txnId, data);

    const key1 = "upi-debit-remitter";

    const recipient = registeredBanks.find(
      (bank) => bank.ifscCodePrefix === data.ifscCode.substring(0, 3)
    );

    if (!recipient) {
      const key = "upi-error";
      const value = "Recipient bank not found";
      await forwardToBank(topic, key, value);
      return;
    }
    const state = await getTXState(data.txnId);
    console.log("Saving beneficiary data: " + JSON.stringify(state));
    if (!state) {
      console.log("State not found");
      return;
    }

    const value1 = JSON.stringify({
      senderBank: state.senderBank,
      beneficiaryBank: state.beneficiaryBank,
      txnId: data.txnId,
      amount: state.data.amount,
    });
    await forwardToBank(recipient.nthToBank, key1, value1);
  } else if (key === "upi-debit-remitter-success") {
    console.log("Remitter Debited");
    const state = await getTXState(data.txnId);
    if (!state) {
      console.log("State not found");
      return;
    }
    const beneficiaryBank = registeredBanks.find(
      (bank) =>
        bank.ifscCodePrefix === state.beneficiaryBank.ifscCode.substring(0, 3)
    );

    if (!beneficiaryBank) {
      const key = "upi-error";
      const value = "Beneficiary bank not found";
      await forwardToBank(topic, key, value);
      return;
    }

    const key1 = "upi-credit-beneficiary";
    const value1 = JSON.stringify({
      senderBank: state.senderBank,
      beneficiaryBank: state.beneficiaryBank,
      txnId: data.txnId,
      amount: state.data.amount,
    });
    await forwardToBank(beneficiaryBank.nthToBank, key1, value1);
    return;
  } else if (key === "upi-credit-beneficiary-success") {
    console.log("Beneficiary Credited");
    console.log("Transaction is complete");
  }
}
