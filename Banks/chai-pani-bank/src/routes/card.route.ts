import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { changeCardPinController, createCardController } from "../controllers/card.controller";

const cardRouter = Router();

cardRouter.post("/new", asyncHandler(createCardController));
cardRouter.patch("/pin", asyncHandler(changeCardPinController));

export default cardRouter;