import type { Request, Response } from "express";
import { IMPS_TranferRequest } from "../types/transaction";
import { initiateIMPSTransfer } from "../services/nth.service";
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
    } = parsedBody.data;

    if (!beneficiaryAccountNo && !beneficiaryMMID) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing beneficiary details",
      });
    }

    if (beneficiaryAccountNo && !benificiaryIFSCode) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing beneficiary IFSC code",
      });
    }

    if (!beneficiaryMobileNo) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing beneficiary mobile number",
      });
    }
    if (!amount) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing amount",
      });
    }
    const request = {
      ...parsedBody.data,
      replyTo: "NTH-to-654321",
    };
    await initiateIMPSTransfer(request);
    res.status(200).json({ status: "OK" });
  }
};
