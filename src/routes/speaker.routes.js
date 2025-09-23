import { Router } from "express";
import {
  createSpeaker,
  selectSpeaker,
} from "../controllers/speaker.controller.js";
import { authorizeRole } from "../middlewares/authorize.middleware.js";

const router = Router();

// Todas las rutas requieren estar logueado como Caregiver
router.post("/create", authorizeRole(["caregiver"]), createSpeaker);
router.post("/select", authorizeRole(["caregiver"]), selectSpeaker);

export default router;
