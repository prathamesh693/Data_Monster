import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes.js";
import dbRouter from "./routes/db.routes.js";
import dataRouter from "./routes/data.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import qualityRouter from "./routes/quality.routes.js";
import governanceRouter from "./routes/governance.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to DataGuard API." });
});

app.use("/api/health", healthRouter);
app.use("/api/db", dbRouter);
app.use("/api", dataRouter);
app.use("/api", dashboardRouter);
app.use("/api", qualityRouter);
app.use("/api", governanceRouter);
app.use("/api", recommendationRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

export default app;
