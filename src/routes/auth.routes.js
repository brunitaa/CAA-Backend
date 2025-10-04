import express from "express";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import {
  registerAdmin,
  verifyAdminToken,
  loginAdmin,
  registerCaregiver,
  verifyTokenCaregiver,
  loginCaregiver,
  logout,
  requestPasswordToken,
  resetPasswordWithToken,
  getProfile,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Admin
router.post("/register-admin", registerAdmin);
router.post("/verify-token-admin", verifyAdminToken);
router.post("/admin/login", loginAdmin);

// Caregiver
router.post("/register-caregiver", registerCaregiver);
router.post("/verify-token-caregiver", verifyTokenCaregiver);
router.post("/caregiver/login", loginCaregiver);

// Password reset
router.post("/request-password-token", requestPasswordToken);
router.post("/reset-password-token", resetPasswordWithToken);

// Perfil y validación
router.get("/validate", verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

router.get("/profile", verifyToken, getProfile);

// Logout (Caregiver o Admin)
router.post("/logout", authorizeRole(["caregiver", "admin"]), logout);

export default router;
