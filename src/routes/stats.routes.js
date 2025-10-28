import express from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getSpeakerDashboard } from "../controllers/userMetrics.Controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,

  getDashboardStats
);

router.get("/speakers/:speakerId", verifyToken, getSpeakerDashboard);

export default router;
