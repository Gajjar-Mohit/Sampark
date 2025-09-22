import express from "express";
import cors from "cors";
import { errorHandler } from "./utils/error_handler";
import router from "./routes";
import client from "prom-client";

const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

app.use("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

app.use("/api/v1", router);

app.use(errorHandler);

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app };
