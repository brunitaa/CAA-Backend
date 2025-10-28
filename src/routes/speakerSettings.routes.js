import express from "express";
import speakerSettingsController from "../controllers/speakerSettings.controller.js";
import validateCaregiver from "../middlewares/validateCaregiver.js";

const router = express.Router();

router.get(
  "/:speakerId",
  validateCaregiver,
  speakerSettingsController.getSettings.bind(speakerSettingsController)
);

router.put(
  "/:speakerId",
  validateCaregiver,
  speakerSettingsController.updateSettings.bind(speakerSettingsController)
);

export default router;
