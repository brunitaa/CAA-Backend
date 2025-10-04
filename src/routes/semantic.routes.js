import { Router } from "express";
import { getSemanticByPos } from "../controllers/semantic.controller.js";

const router = Router();

router.get("/:posId/semantics", getSemanticByPos);

export default router;
