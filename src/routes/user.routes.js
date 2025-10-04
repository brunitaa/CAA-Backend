import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  updateAdmin,
  updateCaregiver,
  updateSpeaker,
  requestEmailChange,
  confirmEmailChange,
  getAdmins,
  getCaregivers,
  getSpeakers,
} from "../controllers/user.controller.js";

const router = express.Router();

// Actualización de datos básicos
router.put("/speaker/:id", verifyToken, updateSpeaker);
router.put("/caregiver/:id", verifyToken, updateCaregiver);
router.put("/admin/:id", verifyToken, updateAdmin);
// Solicitud de cambio de email
router.post("/:id/request-email-change", verifyToken, requestEmailChange);

// Confirmación de cambio de email con OTP
router.post("/:id/confirm-email-change", verifyToken, confirmEmailChange);

router.get("/admins", getAdmins);
router.get("/speakers", getSpeakers);
router.get("/caregivers", getCaregivers);

export default router;
