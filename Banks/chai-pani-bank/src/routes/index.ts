import { Router } from "express";
import accountRoute from "./account.route";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

router.use("/account", accountRoute);

export default router;
