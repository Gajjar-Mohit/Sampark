import type { Request, Response } from "express";
import { CheckBalanceRequest, CreateAccountRequest } from "../types/account";
import { createAccount, getAccountByAccountNo } from "../services/account.service";
export const createAccountController = async (req: Request, res: Response) => {
  const parsedBody = CreateAccountRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await createAccount(
    parsedBody.data.accountHolderName,
    parsedBody.data.accountHolderContactNo,
    parsedBody.data.panCardNo
  );

  return res.status(200).json({
    status: "Success",
    message: "Account created successfully",
    data: response,
  });
};
export const checkBalanceController = async (req: Request, res: Response) => {
  const parsedBody = CheckBalanceRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await getAccountByAccountNo(
    parsedBody.data.accountNo,
    parsedBody.data.ifscCode,
    parsedBody.data.accountHolderContactNo
  );

  return res.status(200).json({
    status: "Success",
    message: "Account balance fetched successfully",
    data: response,
  });
};