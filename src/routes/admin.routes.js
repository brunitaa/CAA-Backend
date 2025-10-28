import { Router } from "express";
import { registerAdmin, loginAdmin } from "../controllers/auth.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";
import { getAdminMetrics } from "../controllers/adminMetrics.controller.js";
import { uploadImage, deleteImage } from "../controllers/image.controller.js";

const router = Router();

router.post("/register", authorizeRole(["admin"]), registerAdmin);

router.post("/login", loginAdmin);

router.get("/metrics", authorizeRole(["admin"]), getAdminMetrics);

router.post("/images", authorizeRole(["admin", "caregiver"]), uploadImage);
router.delete(
  "/images/:id",
  authorizeRole(["admin", "caregiver"]),
  deleteImage
);

export default router;
