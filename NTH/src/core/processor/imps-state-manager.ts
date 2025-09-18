import { redisClient } from "../..";
import { forwardToBank } from "../../egress/forward-to-banks";
import type { BeneficiaryDetails, RemitterDetails } from "../../types/imps";
import { IMPS_FLOW } from "../imps-flow";
import {
  creditToBeneficiary,
  debitFromRemitter,
  verifyDetails,
} from "./imps.processor";
import { registeredBanks } from "../registered-banks";
import {
  saveIntermidiateTXState,
  saveRemitter,
  saveBeneficiary,
  getTXState,
} from "../services/logging.service";

export async function processIMPSTransfer(
  topic: string,
  key: string,
  value: string
) {
  let benificiaryBank: BeneficiaryDetails;
  let remitterBank: RemitterDetails;
  try {
    console.log(`Processing IMPS transfer message from topic: ${topic}`);
    console.log(value);
    console.log(`Processing IMPS transfer message`);
    for (const state of IMPS_FLOW) {
      if (state.key === key) {
        const data = JSON.parse(value);
        console.log(state.step);
        await saveIntermidiateTXState(data.txnId, {
          step: state.step,
          processor: topic,
        });
        if (key === "imps-transfer") {
          const { accountNo, contactNo, mmid, ifscCode } =
            data.remitterDetails as RemitterDetails;
          const { amount } = data;
          remitterBank = {
            accountNo,
            ifscCode,
            contactNo,
            mmid,
          };
          await saveRemitter(data.txnId, remitterBank, amount);
          await verifyDetails(topic, key, value);
        } else if (key.includes("imps-transfer-error")) {
          console.log("IMPS transfer error received");
          await saveIntermidiateTXState(data.txnId, {
            step: "ERROR",
            processor: topic,
          });
          const state = await getTXState(data.txnId);
          const res = JSON.parse(value);

          const initiatedStep = state.processingHistory.find(
            (step: any) => step.step === "TRANSACTION_INITIATED"
          );

          console.log("Transaction is complete: ", res);
          console.log("Remitter bank route: " + initiatedStep.processor);
          const remitterBank = registeredBanks.find(
            (bank) => bank.bankToNTH === initiatedStep.processor
          );

          const key1 = "imps-transfer-error";
          console.log("Remitter bank: " + remitterBank!.name);

          await forwardToBank(remitterBank!.nthToBank, key1, value);
          return;
        } else if (key.includes("imps-transfer-verified-details")) {
          console.log("Beneficiary Verified");
          const res = JSON.parse(value);
          benificiaryBank = {
            accountNo: res.accountNo,
            ifscCode: res.ifscCode,
            contactNo: res.accountHolderContactNo,
            mmid: res.mmid,
          };
          await saveBeneficiary(data.txnId, benificiaryBank);
          const state = await getTXState(data.txnId);
          console.log("Saving beneficiary data: " + JSON.stringify(state));
          if (!state) {
            console.log("State not found");
            return;
          }
          await debitFromRemitter(
            topic,
            state.remitterBank,
            state.beneficiaryBank,
            data.txnId,
            state.amount
          );

          return;
        } else if (key.includes("imps-transfer-debit-remitter-success")) {
          console.log("Remitter Debited");
          const state = await getTXState(data.txnId);
          if (!state) {
            console.log("State not found");
            return;
          }
          await creditToBeneficiary(
            topic,
            state.remitterBank,
            state.beneficiaryBank,
            data.txnId,
            state.amount
          );

          return;
        } else if (key.includes("imps-transfer-credit-benificiary-success")) {
          console.log("Beneficiary Credited");

          const state = await getTXState(data.txnId);
          const res = JSON.parse(value);

          const initiatedStep = state.processingHistory.find(
            (step: any) => step.step === "TRANSACTION_INITIATED"
          );

          console.log("Transaction is complete: ", res);
          console.log("Remitter bank route: " + initiatedStep.processor);
          const remitterBank = registeredBanks.find(
            (bank) => bank.bankToNTH === initiatedStep.processor
          );

          const key1 = "imps-transfer-complete";
          console.log("Remitter bank: " + remitterBank!.name);
          // if

          await forwardToBank(remitterBank!.nthToBank, key1, value);
          return;
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error processing message for topic ${topic}:`, error);
    throw error;
  }
}
