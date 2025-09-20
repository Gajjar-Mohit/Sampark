import { forwardToBank } from "../../egress/forward-to-banks";
import { registeredBanks } from "../registered-banks";

export async function addBankDetails(
  topic: string,
  key: string,
  value: string
) {
  const data = JSON.parse(value);
  const txnId = data.txnId;
  const contactNo = data.contactNo;
  const ifscCode = data.ifscCode;
  console.log("Adding bank details");

  if (!contactNo || !ifscCode || !txnId) {
    const key = "upi-bank-details-adding-error";
    const value = "Missing contact number or IFSC code or TXN ID";
    await forwardToBank(topic, key, value);
    return;
  }

  const findBank = registeredBanks.find(
    (bank) => bank.ifscCodePrefix === ifscCode.substring(0, 3)
  );

  if (!findBank) {
    const key = "upi-bank-details-adding-error";
    const value = "Bank not found";
    await forwardToBank(topic, key, value);
    return;
  }

  await forwardToBank(findBank.nthToBank, key, value);
}
