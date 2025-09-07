import { Router } from "express";
import { addAccountController } from "../controllers/account.controller";
import { asyncHandler } from "../utils/route_wrapper";

const accountRouter = Router();

accountRouter.post("/add", asyncHandler(addAccountController));

export default accountRouter;