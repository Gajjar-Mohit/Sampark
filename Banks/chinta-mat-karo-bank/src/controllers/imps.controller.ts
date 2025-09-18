import type { Request, Response } from "express";
import { IMPS_TranferRequest, type TransferDetails } from "../types/imps";
import { initiateIMPSTransfer } from "../services/nth.service";
import { checkRemitterDetails } from "../services/imps.service";
import { generateTransactionId } from "../utils/transaction_id_generator";

export const initiateIMPSTransferController = async (
  req: Request,
  res: Response
) => {
  const parsedBody = IMPS_TranferRequest.safeParse(req.body);

  if (parsedBody.success) {
    const {
      amount,
      beneficiaryAccountNo,
      beneficiaryMobileNo,
      beneficiaryMMID,
      benificiaryIFSCode,
      remitterAccountNo,
      remitterMobileNo,
      remitterMMID,
      remitterIFSCode,
    } = parsedBody.data;

    // Check mandatory fields
    if (!amount) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing amount",
      });
    }

    if (!beneficiaryMobileNo) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing beneficiary mobile number",
      });
    }

    if (!remitterMobileNo) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing remitter mobile number",
      });
    }

    // Validate beneficiary details - either (accountNo + IFSC) OR MMID
    const hasBeneficiaryAccount = beneficiaryAccountNo && benificiaryIFSCode;
    const hasBeneficiaryMMID = beneficiaryMMID;

    if (!hasBeneficiaryAccount && !hasBeneficiaryMMID) {
      return res.status(400).json({
        status: "ERROR",
        message:
          "Missing beneficiary details. Provide either (Account Number + IFSC Code) or MMID",
      });
    }

    if (beneficiaryAccountNo && !benificiaryIFSCode) {
      return res.status(400).json({
        status: "ERROR",
        message:
          "Missing beneficiary IFSC code. IFSC code is required when Account Number is provided",
      });
    }

    // Validate remitter details - either (accountNo + IFSC) OR MMID
    const hasRemitterAccount = remitterAccountNo && remitterIFSCode;
    const hasRemitterMMID = remitterMMID;

    if (!hasRemitterAccount && !hasRemitterMMID) {
      return res.status(400).json({
        status: "ERROR",
        message:
          "Missing remitter details. Provide either (Account Number + IFSC Code) or MMID",
      });
    }

    if (remitterAccountNo && !remitterIFSCode) {
      return res.status(400).json({
        status: "ERROR",
        message:
          "Missing remitter IFSC code. IFSC code is required when Account Number is provided",
      });
    }

    const txnId = generateTransactionId();

       const request: TransferDetails = {
         txnId,
         amount: amount,
         remitterDetails: {
           accountNo: remitterAccountNo ?? "",
           ifscCode: remitterIFSCode ?? "",
           contactNo: remitterMobileNo,

           mmid: remitterMMID ?? "",
         },
         beneficiaryDetails: {
           accountNo: beneficiaryAccountNo ?? "",
           ifscCode: benificiaryIFSCode ?? "",
           contactNo: beneficiaryMobileNo,
           mmid: beneficiaryMMID ?? "",
         },
       };

    const remitter = await checkRemitterDetails(
      remitterMobileNo,
      remitterAccountNo ?? "",
      remitterIFSCode ?? "",
      remitterMMID ?? ""
    );
    if (!remitter) {
      return res.status(400).json({
        status: "ERROR",
        message: "Remitter details not found",
      });
    } else {
       try {
         const response = await initiateIMPSTransfer(request);
         return res
           .status(200)
           .json({ status: "Transfer complete", data: response });
       } catch (error) {
         return res.status(500).json({
           status: "ERROR",
           message: "Error initiating transfer",
           error: error,
         });
       }
    }
  }
};
