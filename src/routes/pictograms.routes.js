import express from "express";
import * as pictogramController from "../controllers/pictogram.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  uploadImage.single("imageFile"),
  pictogramController.createPictogram
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  uploadImage.single("imageFile"), // multer
  pictogramController.updatePictogram
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  pictogramController.deletePictogram
);

router.post(
  "/assign-grids",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  pictogramController.assignPictogramToGrids
);

router.get(
  "/",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  pictogramController.getAllPictograms
);

router.get(
  "/:id",
  verifyToken,
  authorizeRole(["admin", "caregiver"]),
  pictogramController.getPictogram
);

export default router;
