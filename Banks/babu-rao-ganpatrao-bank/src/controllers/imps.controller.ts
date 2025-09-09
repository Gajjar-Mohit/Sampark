import type { Request, Response } from "express";
import { IMPS_TranferRequest } from "../types/transaction";
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
    } = parsedBody.data;
    if (!beneficiaryAccountNo && !beneficiaryMMID) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing beneficiary details",
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
    res.status(200).json({ status: "OK" , parsedBody});
  }
};
