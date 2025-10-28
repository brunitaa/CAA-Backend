import { Router } from "express";
import {
  addPictogramsToGrid,
  addPictogramsToGridAdmin,
  removePictogramFromGrid,
  listPictogramsByGrid,
  orderGridPictograms,
} from "../controllers/gridPictogram.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const router = Router();

router.post(
  "/assign-pictogram/:gridId",
  authorizeRole(["admin", "caregiver"]),
  addPictogramsToGrid
);

router.post(
  "/admin/assign-pictogram/:gridId",
  authorizeRole(["admin"]),
  addPictogramsToGridAdmin
);

router.delete(
  "/delete",
  authorizeRole(["admin", "caregiver"]),
  removePictogramFromGrid
);

router.get(
  "/:gridId",
  authorizeRole(["admin", "caregiver"]),
  listPictogramsByGrid
);

router.post("/:id/order", orderGridPictograms);

export default router;
