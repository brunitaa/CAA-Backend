import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const router = Router();

// Rutas públicas
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// Ruta protegida solo para admins
router.post(
  "/admin/create-mobile-user",
  verifyToken,
  isAdmin,
  authController.createMobileUser
);

// Rutas protegidas
router.post("/logout", verifyToken, authController.logout);
router.get("/perfil", verifyToken, authController.getProfile);
router.get("/admin", verifyToken, isAdmin, (req, res) =>
  res.json({ msg: "Bienvenido administrador" })
);

export default router;
