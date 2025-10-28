import express from "express";
import { authorizeRole, verifyToken } from "../middlewares/auth.middleware.js";
import {
  updateAdmin,
  updateCaregiver,
  updateSpeaker,
  requestEmailChange,
  confirmEmailChange,
  getAdmins,
  getCaregivers,
  getSpeakers,
  toggleActive,
} from "../controllers/user.controller.js";

const router = express.Router();

router.patch(
  "/:id/toggle-active",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  toggleActive
);

router.put("/speaker/:id", verifyToken, updateSpeaker);
router.put("/caregiver/:id", verifyToken, updateCaregiver);
router.put("/admin/:id", verifyToken, updateAdmin);
router.post("/:id/request-email-change", verifyToken, requestEmailChange);

router.post("/:id/confirm-email-change", verifyToken, confirmEmailChange);

router.get("/admins", getAdmins);
router.get("/speakers", getSpeakers);
router.get("/caregivers", getCaregivers);

export default router;
