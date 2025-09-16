
import type { Request, Response } from "express";
import { getAllTransactions } from "../services/transaction.service";

export const getAllTransactionsController = async (req: Request, res: Response) => {
  const response = await getAllTransactions();

  if (!response) {
    return res.status(404).json({
      status: "Error",
      message: "No transactions found",
      data: [],
    });
  }

  return res.status(200).json({
    status: "Success",
    message: "Transactions fetched successfully",
    data: response,
  });
};