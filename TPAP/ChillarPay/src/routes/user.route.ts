import { Router } from "express";
import { asyncHandler } from "../utils/route_wrapper";
import { createUserController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.post("/create", asyncHandler(createUserController));

export default userRouter;