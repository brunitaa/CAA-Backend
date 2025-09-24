import { Router } from "express";
import {
  createSpeaker,
  selectSpeaker,
  getSpeakersByCaregiver,
} from "../controllers/speaker.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren estar logueado como Caregiver
router.post("/create", authorizeRole(["caregiver"]), createSpeaker);
router.post("/select", authorizeRole(["caregiver"]), selectSpeaker);
router.get(
  "/my-speakers",
  authorizeRole(["caregiver"]),
  getSpeakersByCaregiver
);

export default router;
