import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  updateUser,
  requestEmailChange,
  confirmEmailChange,
} from "../controllers/user.controller.js";

const router = express.Router();

// Actualización de datos básicos
router.put("/:id", verifyToken, updateUser);

// Solicitud de cambio de email
router.post("/:id/request-email-change", verifyToken, requestEmailChange);

// Confirmación de cambio de email con OTP
router.post("/:id/confirm-email-change", verifyToken, confirmEmailChange);

export default router;
