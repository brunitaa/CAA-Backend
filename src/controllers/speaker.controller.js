import { SpeakerService } from "../services/speaker.service.js";

const speakerService = new SpeakerService();

// Crear speaker
export const createSpeaker = async (req, res) => {
  try {
    const caregiverId = req.user.userId;
    const { username, gender, age } = req.body;

    const result = await speakerService.createSpeaker(
      { username, gender, age },
      caregiverId
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Seleccionar speaker (generar token/session)
export const selectSpeaker = async (req, res) => {
  try {
    const caregiverId = req.user.userId;
    const { speakerId } = req.body;

    if (!speakerId)
      return res.status(400).json({ message: "speakerId es requerido" });

    const result = await speakerService.selectSpeaker(caregiverId, speakerId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener speakers de un caregiver
export const getSpeakersByCaregiver = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const caregiverId = req.user.userId;
    const speakers = await speakerService.getSpeakersByCaregiver(caregiverId);
    res.json({ speakers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
