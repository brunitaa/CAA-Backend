import express from "express";
import {
  getAllPos,
  getPosById,
  createPos,
  updatePos,
  deletePos,
  getSemanticByPos,
  createSemantic,
  deleteSemantic,
} from "../controllers/pos.controller.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllPos);
router.get("/:id", getPosById);
router.post("/", authorizeRole(["admin"]), createPos);
router.put("/:id", authorizeRole(["admin"]), updatePos);
router.delete("/:id", authorizeRole(["admin"]), deletePos);

export default router;
