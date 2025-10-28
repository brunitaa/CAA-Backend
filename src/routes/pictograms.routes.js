import express from "express";
import {
  createPictogram,
  deletePictogram,
  restorePictogram,
  getAllPictograms,
  getArchivedPictograms,
  getPictogram,
  getAllPos,
  updatePictogramAdmin,
  updatePictogramByCaregiver,
  updatePictogramBySpeaker,
} from "../controllers/pictogram.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/dropdown/pos", authorizeRole(["admin", "caregiver"]), getAllPos);

router.post(
  "/create",
  authorizeRole(["admin", "caregiver"]),
  uploadImage.single("imageFile"),
  createPictogram
);

router.put(
  "/edit/caregiver/:id",
  verifyToken,
  authorizeRole(["caregiver"]),
  uploadImage.single("imageFile"),
  updatePictogramByCaregiver
);
router.put(
  "/edit/speaker/:id",
  verifyToken,
  authorizeRole(["speaker"]),
  uploadImage.single("imageFile"),
  updatePictogramBySpeaker
);
router.put(
  "/edit/admin/:id",
  verifyToken,
  uploadImage.single("imageFile"),
  updatePictogramAdmin
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

router.get(
  "/",
  authorizeRole(["admin", "caregiver", "speaker"]),
  getAllPictograms
);

router.get(
  "/archived",
  authorizeRole(["admin", "caregiver"]),
  getArchivedPictograms
);

router.get("/:id", authorizeRole(["admin", "caregiver"]), getPictogram);

export default router;
