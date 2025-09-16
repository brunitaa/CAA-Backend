import { Router } from "express";
import * as pictogramController from "../controllers/pictogram.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Base pictograms
router.get("/base", pictogramController.getBasePictograms);
router.post(
  "/base",
  verifyToken,
  isAdmin,
  pictogramController.createBasePictogram
);

// User pictograms
router.get("/user", verifyToken, pictogramController.getUserPictograms);
router.post("/user", verifyToken, pictogramController.createUserPictogram);

// Update & delete (base o usuario, según permisos)
router.put("/:id", verifyToken, pictogramController.updatePictogram);
router.delete("/:id", verifyToken, pictogramController.deletePictogram);

// Ver un pictograma específico (base o usuario)
router.get("/:id", verifyToken, pictogramController.getPictogramById);

export default router;
