import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { initiateIMPSTransferController } from "../controllers/imps.controller";


const impsRouter = Router();

impsRouter.post("/initiate", asyncHandler(initiateIMPSTransferController));

export default impsRouter;