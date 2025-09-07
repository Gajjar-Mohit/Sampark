import type { Request, Response } from "express";
import { CheckBankDetailsRequest } from "../types/tpap";
import { getBankDetails } from "../services/tpap.service";
export const getBankDetailsController = async (req: Request, res: Response) => {
  const parsedBody = CheckBankDetailsRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await getBankDetails(
    parsedBody.data.contactNo,
    parsedBody.data.ifscCode
  );

  return res.status(200).json({
    status: "Success",
    message: "Bank details fetched successfully",
    data: response,
  });
};
