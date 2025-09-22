import type { Request, Response } from "express";
import { AddAccountRequest } from "../types/account";
import { addAccount } from "../services/account.service";
export const addAccountController = async (req: Request, res: Response) => {
  const parsedBody = AddAccountRequest.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await addAccount(
    parsedBody.data.contactNo,
    parsedBody.data.ifscCode
  );

  return res.status(200).json({
    status: "Success",
    message: "Account added successfully.",
    data: response,
  });
};
