import { createSentenceService } from "../services/sentence.service.js";

export const createSentence = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "speaker") {
      return res
        .status(403)
        .json({ message: "Solo los speakers pueden crear oraciones" });
    }

    const { pictograms, speed, voice } = req.body;

    const sentence = await createSentenceService(user.userId, pictograms, {
      speed,
      voice,
    });

    res.status(201).json({
      message: "Oración creada correctamente",
      sentence,
    });
  } catch (err) {
    console.error("Error creando oración:", err);
    res.status(400).json({ message: err.message });
  }
};
