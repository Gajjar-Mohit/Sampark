import { response, type Request, type Response } from "express";
import { getAllTransactionsService } from "../services/transaction.service";

export const getAllTransactionsController = async (
  req: Request,
  res: Response
) => {
  const { vpa, userId } = req.body;

  if (!vpa) {
    return res.status(400).json({
      success: false,
      error: "VPA is missing",
    });
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "UserId is missing",
    });
  }

  const transactions = await getAllTransactionsService(vpa, userId);

  return res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    data: transactions,
  });
};
