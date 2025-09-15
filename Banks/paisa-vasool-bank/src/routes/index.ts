import { Router } from "express";
import accountRoute from "./account.route";
import cardRoute from "./card.route";
import tpapRouter from "./tpap.route";
import impsRouter from "./imps.route";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

router.use("/account", accountRoute);
router.use("/card", cardRoute);
router.use("/tpap", tpapRouter);
router.use("/imps", impsRouter);

export default router;
