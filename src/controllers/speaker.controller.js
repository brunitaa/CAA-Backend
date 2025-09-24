import { SpeakerService } from "../services/speaker.service.js";
import prisma from "../lib/prisma.js";

const speakerService = new SpeakerService();

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

export const getSpeakersByCaregiver = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const caregiverId = req.user.userId;

    const relations = await prisma.caregiverSpeaker.findMany({
      where: { caregiverId },
      include: {
        speaker: {
          select: {
            id: true,
            username: true,
            gender: true,
            age: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    const speakers = relations.map((r) => r.speaker);

    res.json({ speakers });
  } catch (err) {
    console.error("❌ Error en getSpeakersByCaregiver:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
