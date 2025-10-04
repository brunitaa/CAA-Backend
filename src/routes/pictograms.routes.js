import express from "express";
import {
  createPictogram,
  updatePictogram,
  deletePictogram,
  restorePictogram,
  getAllPictograms,
  getArchivedPictograms,
  getPictogram,
  getAllPos,
  getAllSemanticCategories,
} from "../controllers/pictogram.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/create",
  authorizeRole(["admin", "caregiver"]),
  uploadImage.single("imageFile"),
  createPictogram
);

router.put(
  "/edit/:id",
  authorizeRole(["admin", "caregiver"]),
  uploadImage.single("imageFile"),
  updatePictogram
);

router.delete(
  "/delete/:id",
  authorizeRole(["admin", "caregiver"]),
  deletePictogram
);

router.patch(
  "/restore/:id",
  authorizeRole(["admin", "caregiver"]),
  restorePictogram
);

router.get("/", authorizeRole(["admin", "caregiver"]), getAllPictograms);

router.get(
  "/archived",
  authorizeRole(["admin", "caregiver"]),
  getArchivedPictograms
);

router.get("/:id", authorizeRole(["admin", "caregiver"]), getPictogram);

router.get("/dropdown/pos", authorizeRole(["admin", "caregiver"]), getAllPos);

// Obtener todas las categorías semánticas para dropdown
router.get(
  "/dropdown/semantic",
  authorizeRole(["admin", "caregiver"]),
  getAllSemanticCategories
);

export default router;
