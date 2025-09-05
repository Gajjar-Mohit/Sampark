import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { createAccountController } from "../controllers/account.controller";

const accountRouter = Router();

accountRouter.post("/new", asyncHandler(createAccountController));

export default accountRouter;