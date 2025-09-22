import { response, type Request, type Response } from "express";
import {
  getAllTransactionsService,
  pushTransactionService,
} from "../services/transaction.service";
import {
  GetAllTransactionsRequest,
  PushTransactionRequest,
} from "../types/transaction";

export const getAllTransactionsController = async (
  req: Request,
  res: Response
) => {
  const parsedBody = GetAllTransactionsRequest.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }
  const { vpa, userId } = parsedBody.data;

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

  try {
    const transactions = await getAllTransactionsService(vpa, userId);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching transactions",
      message: error.toString(),
    });
  }
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
  const { toVpa, amount, contactNo } = parsedBody.data;

  if (!toVpa && toVpa.includes("@")) {
    return res.status(400).json({
      success: false,
      error: "VPA is missing or invalid",
    });
  }
  if (!amount) {
    return res.status(400).json({
      success: false,
      error: "UserId is missing",
    });
  }

  try {
    const transaction = await pushTransactionService(toVpa, amount, contactNo);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching transactions",
      message: error.toString(),
    });
  }
};
