import { Router } from "express";
import {
  createSentence,
  getAllSentences,
  saveMLSuggestion,
  saveUserSelection,
} from "../controllers/sentence.controller.js";
import { getPictogramsML } from "../controllers/pictogram.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { speakerCanCreateSentences } from "../middlewares/speakerAuth.middleware.js";

const router = Router();

router.post("/create", verifyToken, speakerCanCreateSentences, createSentence);
router.get("/model/:id", getPictogramsML);
router.get("/all", getAllSentences);
// Guardar sugerencias del ML
router.post("/suggested", saveMLSuggestion);

// Guardar pictogramas usados por el usuario
router.patch("/used", saveUserSelection);

export default router;
