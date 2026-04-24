import { Router } from "express";
import { recommendationsHandler } from "../controllers/recommendation.controller.js";

const recommendationRouter = Router();

recommendationRouter.get("/recommendations", recommendationsHandler);

export default recommendationRouter;
