import { Router } from "express";
import { getBankDetailsController } from "../controllers/tpap.controller";
import { asyncHandler } from "../utils/route_wrapper";

const tpapRouter = Router();

tpapRouter.post("/check",asyncHandler(getBankDetailsController));

export default tpapRouter;