import { Router } from "express";
import {
  addPictogramsToGrid,
  removePictogramFromGrid,
  listPictogramsByGrid,
} from "../controllers/gridPictogram.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const router = Router();

// POST /grid-pictograms → agrega uno o varios pictogramas a uno o varios grids
router.post(
  "/assign-pictogram",
  authorizeRole(["admin", "caregiver"]),
  addPictogramsToGrid
);

// DELETE /grid-pictograms → elimina uno o varios pictogramas de uno o varios grids
router.delete(
  "/grid-pictogram",
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
