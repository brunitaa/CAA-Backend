import express from "express";
import {
  getAllPos,
  getPosById,
  updatePos,
} from "../controllers/pos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllPos);
router.get("/:id", getPosById);
router.put("/:id", updatePos);

export default router;
