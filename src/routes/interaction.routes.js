import { Router } from "express";
import {
  createSentence,
  getAllSentences,
  saveMLSuggestion,
  saveUserSelection,
} from "../controllers/sentence.controller.js";

const router = Router();

router.post("/suggested", saveMLSuggestion);

// Guardar pictogramas usados por el usuario
router.patch("/used", saveUserSelection);

export default router;
