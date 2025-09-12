import { kafka } from "../..";
import { forwardToBank } from "../../egress/forward-to-banks";
import { registeredBanks } from "../registered-banks";

export async function verifyDetails(topic: string, key: string, value: string) {
  const data = JSON.parse(value);
  const amount = data.amount;
  const beneficiaryAccountNo = data.beneficiaryAccountNo;
  const beneficiaryMobileNo = data.beneficiaryMobileNo;
  const beneficiaryMMID = data.beneficiaryMMID;
  const benificiaryIFSCode = data.benificiaryIFSCode;
  const txnId = data.txnId;
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

    console.log("Benificiary bank: " + benificiaryBank?.name);

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
      txnId: txnId,
    });
    await forwardToBank(benificiaryBank.nthToBank, key, value);
    return benificiaryBank;
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
    return benificiaryBank;
  } else {
    const key = "imps-transfer-error";
    const value = "Missing beneficiary details";
    await forwardToBank(topic, key, value);
  }
}

export async function debitFromRemitter(
  topic: string,
  remitterDetails: any,
  beneficiaryDetails: any,
  txnId: string
) {
  console.log("Debiting from remitter");

  const remitterBank = registeredBanks.find(
    (bank) => bank.ifscCodePrefix === remitterDetails.ifscCode.substring(0, 3)
  );
  if (!remitterBank) {
    const key = "imps-transfer-error";
    const value = "Remitter bank not found";
    forwardToBank(topic, key, value);
    return;
  }

  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending debit request to " + remitterBank.name);
  await producer.send({
    topic: remitterBank.nthToBank,
    messages: [
      {
        key: "imps-transfer-debit-remitter",
        value: JSON.stringify({
          ...remitterDetails,
          ...beneficiaryDetails,
          txnId: txnId,
        }),
      },
    ],
  });
}

export async function creditToBeneficiary(
  topic: string,
  remitterDetails: any,
  beneficiaryDetails: any,
  txnId: string
) {
  const beneficiaryBank = registeredBanks.find(
    (bank) =>
      bank.ifscCodePrefix === beneficiaryDetails.ifscCode.substring(0, 3)
  );
  if (!beneficiaryBank) {
    const key = "imps-transfer-error";
    const value = "Beneficiary bank not found";
    forwardToBank(topic, key, value);
    return;
  }

  const producer = kafka.producer();
  await producer.connect();
  console.log("Sending credit request to " + beneficiaryBank.name);
  await producer.send({
    topic: beneficiaryBank.nthToBank,
    messages: [
      {
        key: "imps-transfer-credit-beneficiary",
        value: JSON.stringify({
          ...remitterDetails,
          ...beneficiaryDetails,
          txnId: txnId,
        }),
      },
    ],
  });
}
