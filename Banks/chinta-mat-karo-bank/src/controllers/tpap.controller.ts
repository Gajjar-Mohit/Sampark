import type { Request, Response } from "express";
import { CheckBankDetailsRequest, PushTransactionRequest } from "../types/upi";
import { linkBankDetails, pushTransaction } from "../services/nth.service";
import { generateTransactionId } from "../utils/transaction_id_generator";

export const getBankDetailsController = async (req: Request, res: Response) => {
  const parsedBody = CheckBankDetailsRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const txnId = generateTransactionId();

  const response = await linkBankDetails(
    parsedBody.data.contactNo,
    parsedBody.data.ifscCode,
    txnId
  );

  return res.status(200).json({
    status: "Success",
    message: "Bank details fetched successfully",
    data: response,
  });
};

export const pushTransactionController = async (
  req: Request,
  res: Response
) => {
  
  const parsedBody = PushTransactionRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const txnId = generateTransactionId();

  const response = await pushTransaction(
    parsedBody.data.toVpa,
    parsedBody.data.fromVpa,
    parsedBody.data.amount,
    txnId
  );

  return res.status(200).json({
    status: "Success",
    message: "Bank details fetched successfully",
    data: response,
  });
};
