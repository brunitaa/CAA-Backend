import { Router } from "express";
const router = Router();
import { predictPictogramsController } from "../controllers/prediction.controller.js";

router.post("/predict", predictPictogramsController);

export default router;
