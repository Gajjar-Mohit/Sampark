import { Router } from "express";
import { getBankDetailsController, pushTransactionController } from "../controllers/tpap.controller";
import { asyncHandler } from "../utils/route_wrapper";

const tpapRouter = Router();

tpapRouter.post("/check", asyncHandler(getBankDetailsController));
tpapRouter.post("/push", asyncHandler(pushTransactionController));

export default tpapRouter;
