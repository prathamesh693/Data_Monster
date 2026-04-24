import { Router } from "express";
import { createDbClient } from "../db/index.js";

const dbRouter = Router();

dbRouter.get("/status", async (_req, res) => {
  const client = createDbClient();
  try {
    const result = await client.testConnection();
    res.json({
      database: client.name,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      database: client.name,
      ok: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
});

export default dbRouter;
