import { Router } from "express";
import {
  qualityChecksHandler,
  qualitySummaryHandler,
} from "../controllers/quality.controller.js";

const qualityRouter = Router();

qualityRouter.get("/quality-checks", qualitySummaryHandler);
qualityRouter.get("/quality-list", qualityChecksHandler);

export default qualityRouter;
