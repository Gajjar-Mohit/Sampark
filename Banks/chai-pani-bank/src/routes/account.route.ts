import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import {
  checkBalanceController,
  createAccountController,
  getAllAccountsController,
} from "../controllers/account.controller";

const accountRouter = Router();

accountRouter.post("/new", asyncHandler(createAccountController));
accountRouter.post("/check-balance", asyncHandler(checkBalanceController));
accountRouter.get("/all", asyncHandler(getAllAccountsController));
export default accountRouter;
