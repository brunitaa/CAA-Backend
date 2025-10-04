// src/routes/stats.routes.js
import express from "express";
import { statsController } from "../controllers/stats.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,

  statsController.getDashboard
);

export default router;
