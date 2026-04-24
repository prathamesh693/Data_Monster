import { Router } from "express";
import { governanceHandler } from "../controllers/governance.controller.js";

const governanceRouter = Router();

governanceRouter.get("/governance", governanceHandler);

export default governanceRouter;
