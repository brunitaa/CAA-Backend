// routes/grid.routes.js
import express from "express";
import {
  createGrid,
  getGrids,
  getGridById,
  updateGrid,
  deleteGrid,
  getArchivedGrids,
  restoreGrid,
} from "../controllers/grid.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren token
router.use(verifyToken);

router.post("/create", createGrid);
router.get("/", getGrids);
router.get("/:id", getGridById);
router.put("/edit/:id", updateGrid);
router.delete("/delete/:id", deleteGrid);

// Rutas para grids archivados
router.get("/archived/all", getArchivedGrids);
router.patch("/restore/:id", restoreGrid);

export default router;
