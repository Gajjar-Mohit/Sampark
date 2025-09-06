import { Router } from "express";
import userRouter from "./user.route";
import accountRouter from "./account.route";

const router = Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);

export default router;
