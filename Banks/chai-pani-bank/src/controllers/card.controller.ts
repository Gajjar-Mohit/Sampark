import { createCard } from "../services/account.service";
import type { Request, Response } from "express";
import { CreateCardRequest } from "../types/card";

export const createCardController = async (req: Request, res: Response) => {
  const parsedBody = CreateCardRequest.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await createCard(
    parsedBody.data.bankAccountNo,
    parsedBody.data.cardType,
    parsedBody.data.provider
  );

  return res.status(200).json({
    status: "Success",
    message: "Card created successfully",
    data: response,
  });
};
