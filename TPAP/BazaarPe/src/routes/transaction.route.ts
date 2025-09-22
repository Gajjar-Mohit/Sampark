import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { getAllTransactionsController, pushTransactionController } from "../controllers/transaction.controller";

const transactionRouter = Router()

transactionRouter.post("/all", asyncHandler(getAllTransactionsController))
transactionRouter.post("/push", asyncHandler(pushTransactionController));

export default transactionRouter