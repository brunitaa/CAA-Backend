// src/routes/admin.routes.js
import { Router } from "express";
import { registerAdmin, loginAdmin } from "../controllers/auth.controller.js";
import { authorizeRole } from "../middlewares/authorize.middleware.js";

const router = Router();

// Registrar admin → solo otro admin podría hacerlo en producción
router.post("/register", authorizeRole(["admin"]), registerAdmin);

// Login admin
router.post("/login", loginAdmin);

export default router;
