import { Router } from "express";
import userRouter from "./user.route";
import accountRouter from "./account.route";
import transactionRouter from "./transaction.route";

const router = Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/transaction", transactionRouter);
export default router;
