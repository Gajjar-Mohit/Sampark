import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { checkBalanceController, createAccountController } from "../controllers/account.controller";

const accountRouter = Router();

accountRouter.post("/new", asyncHandler(createAccountController));
accountRouter.post("/check-balance", asyncHandler(checkBalanceController));

export default accountRouter;