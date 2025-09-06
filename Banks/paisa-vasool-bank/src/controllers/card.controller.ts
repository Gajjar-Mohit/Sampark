import type { Request, Response } from "express";
import { CreateCardRequest, UpdateCardPinRequest } from "../types/card";
import { changeCardPin, createCard } from "../services/card.service";

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

export const changeCardPinController = async (req: Request, res: Response) => {
  const parsedBody = UpdateCardPinRequest.safeParse(req.body);
  if (!parsedBody.success) {
    console.log(parsedBody.error);
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  const response = await changeCardPin(
    parsedBody.data.cardNumber,
    parsedBody.data.newPin.toString()
  );

  return res.status(200).json({
    status: "Success",
    message: "Card pin updated successfully",
    data: response,
  });
};
