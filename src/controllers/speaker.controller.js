import { SpeakerService } from "../services/speaker.service.js";
import prisma from "../lib/prisma.js";
const speakerService = new SpeakerService();
import { signToken } from "../utils/jwt.js";
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
  const { caregiverId, speakerId } = req.body;

  if (!caregiverId || !speakerId) {
    return res.status(400).json({ message: "Faltan caregiverId o speakerId" });
  }

  try {
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    const speaker = await prisma.user.findUnique({
      where: { id: speakerId },
    });
    if (!speaker || speaker.roleId !== 3) throw new Error("Speaker no válido");

    const relation = await prisma.caregiverSpeaker.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });
    if (!relation) throw new Error("El speaker no pertenece a este caregiver");

    const session = await prisma.userSession.create({
      data: { userId: speaker.id },
    });

    const token = signToken({
      userId: speaker.id,
      role: "speaker",
      username: speaker.username,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.json({ token, sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
};

export const getSpeakerProfile = async (req, res) => {
  try {
    if (req.user.role !== "speaker") {
      return res
        .status(403)
        .json({ message: "Solo los speakers pueden acceder a este recurso" });
    }

    const speakerId = req.user.userId;
    const result = await speakerService.getSpeakerProfile(speakerId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
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
