import { Router } from "express";
import {
  addPictogramsToGrid,
  addPictogramsToGridAdmin,
  removePictogramFromGrid,
  listPictogramsByGrid,
} from "../controllers/gridPictogram.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const router = Router();

router.post(
  "/assign-pictogram",
  authorizeRole(["admin", "caregiver"]),
  addPictogramsToGrid
);

router.post(
  "/admin/assign-pictogram/:gridId",
  authorizeRole(["admin"]),
  addPictogramsToGridAdmin
);

// DELETE /grid-pictograms → elimina uno o varios pictogramas de uno o varios grids
router.delete(
  "/delete",
  authorizeRole(["admin", "caregiver"]),
  removePictogramFromGrid
);

// GET /grid-pictograms/:gridId → lista pictogramas de un grid
router.get(
  "/:gridId",
  authorizeRole(["admin", "caregiver"]),
  listPictogramsByGrid
);

export default router;
