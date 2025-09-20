import { forwardToBank } from "../../egress/forward-to-banks";
import { addBankDetails } from "../processor/upi.processor";

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
  }
}
