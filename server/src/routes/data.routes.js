import { Router } from "express";
import {
  connectToDatabase,
  getColumns,
  getTables,
  postQuery,
} from "../controllers/db.controller.js";

const dataRouter = Router();

dataRouter.post("/connect", connectToDatabase);
dataRouter.get("/tables", getTables);
dataRouter.get("/columns", getColumns);
dataRouter.post("/query", postQuery);

export default dataRouter;
