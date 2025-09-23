import { Router } from "express";
import {
  addPictogramToGrid,
  removePictogramFromGrid,
  listPictogramsByGrid,
} from "../controllers/gridPictogram.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authorizeRole(["admin", "caregiver"]), addPictogramToGrid);
router.delete(
  "/",
  authorizeRole(["admin", "caregiver"]),
  removePictogramFromGrid
);
router.get(
  "/:gridId",
  authorizeRole(["admin", "caregiver"]),
  listPictogramsByGrid
);

export default router;
