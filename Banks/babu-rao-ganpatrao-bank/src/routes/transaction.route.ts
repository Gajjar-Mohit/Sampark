import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { getAllTransactionsController } from "../controllers/transaction.controller";

const transactionRouter = Router();

transactionRouter.get("/all", asyncHandler(getAllTransactionsController));  

export default transactionRouter;