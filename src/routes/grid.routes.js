// routes/grid.routes.js
import express from "express";
import {
  createGrid,
  getGrids,
  getGridById,
  updateGrid,
  deleteGrid,
} from "../controllers/grid.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren token
router.use(verifyToken);

router.post("/", createGrid);
router.get("/", getGrids);
router.get("/:id", getGridById);
router.put("/:id", updateGrid);
router.delete("/:id", deleteGrid);

export default router;
