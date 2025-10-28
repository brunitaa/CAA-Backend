import { Router } from "express";
import { createSentence } from "../controllers/sentence.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { speakerCanCreateSentences } from "../middlewares/speakerAuth.middleware.js";

const router = Router();

router.post("/create", verifyToken, speakerCanCreateSentences, createSentence);

export default router;
