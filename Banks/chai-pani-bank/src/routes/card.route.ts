import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { createCardController } from "../controllers/card.controller";

const cardRouter = Router();

cardRouter.post("/new", asyncHandler(createCardController));

export default cardRouter;