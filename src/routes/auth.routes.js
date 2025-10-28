import express from "express";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import {
  registerAdmin,
  verifyAdminToken,
  loginAdmin,
  registerCaregiver,
  verifyOtpCaregiver,
  loginCaregiver,
  logout,
  requestPasswordToken,
  resetPasswordWithToken,
  getProfile,
  resendOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/verify-token-admin", verifyAdminToken);
router.post("/admin/login", loginAdmin);

router.post("/register-caregiver", registerCaregiver);
router.post("/verify-otp-caregiver", verifyOtpCaregiver);
router.post("/caregiver/login", loginCaregiver);

router.post("/request-password-token", requestPasswordToken);
router.post("/reset-password-token", resetPasswordWithToken);

router.get("/validate", verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

router.get("/profile", verifyToken, getProfile);

// Logout (Caregiver o Admin)
router.post("/logout", authorizeRole(["caregiver", "admin"]), logout);
router.post("/resend-otp", resendOtp);

export default router;
