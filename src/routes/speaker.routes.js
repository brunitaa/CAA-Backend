import { Router } from "express";
import {
  createSpeaker,
  selectSpeaker,
  getSpeakersByCaregiver,
  getSpeakerProfile,
} from "../controllers/speaker.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authorizeRole(["caregiver"]), createSpeaker);

router.post("/select", authorizeRole(["caregiver"]), selectSpeaker);

router.get(
  "/my-speakers",
  authorizeRole(["caregiver"]),
  getSpeakersByCaregiver
);

router.get("/me", authorizeRole(["speaker"]), getSpeakerProfile);

export default router;
