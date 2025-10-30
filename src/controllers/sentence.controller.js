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

import { getAllSentencesService } from "../services/sentence.service.js";

export const getAllSentences = async (req, res) => {
  try {
    const sentences = await getAllSentencesService();
    return res.status(200).json(sentences);
  } catch (error) {
    console.error("Error al obtener oraciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

import {
  saveMLSuggestionService,
  saveUserSelectionService,
} from "../services/sentence.service.js";

export const saveMLSuggestion = async (req, res) => {
  try {
    const saved = await saveMLSuggestionService(req.body);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error guardando sugerencia ML:", err);
    res.status(500).json({ message: err.message });
  }
};

export const saveUserSelection = async (req, res) => {
  try {
    const updated = await saveUserSelectionService(req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error guardando selección usuario:", err);
    res.status(500).json({ message: err.message });
  }
};
