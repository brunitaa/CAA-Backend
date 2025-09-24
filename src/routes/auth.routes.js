import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import {
  requestPasswordOTP,
  resetPasswordWithOTP,
  getProfile,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/validate", verifyToken, (req, res) => {
  // Si pasó el middleware, el token es válido
  res.json({
    valid: true,
    user: req.user, // { userId, role, ... }
  });
});
router.post("/request-password-otp", requestPasswordOTP);
router.post("/reset-password-otp", resetPasswordWithOTP);
router.get("/profile", verifyToken, getProfile);
// Caregiver login
router.post("/register-caregiver", authController.registerCaregiver);
// Verificación de OTP
router.post("/verify-otp", authController.verifyOTP);

// Reenvío de OTP
router.post("/resend-otp", authController.resendOTP);
router.post("/caregiver/login", authController.loginCaregiver);

// Logout (Caregiver o Speaker)
router.post(
  "/logout",
  authorizeRole(["caregiver", "admin"]),
  authController.logout
);

export default router;
