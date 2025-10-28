import prisma from "../lib/prisma.js";

export const getSpeakerDashboard = async (req, res) => {
  try {
    const caregiverId = req.user.id;
    const speakerId = parseInt(req.params.speakerId);

    const relation = await prisma.caregiverSpeaker.findFirst({
      where: {
        caregiverId,
        speakerId,
      },
    });

    if (!relation) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a este speaker" });
    }

    const speaker = await prisma.user.findUnique({
      where: { id: speakerId },
      include: {
        statistics: true,
        grids: true,
        pictograms: true,
        sessions: true,
      },
    });

    if (!speaker) {
      return res.status(404).json({ message: "Speaker no encontrado" });
    }

    const response = {
      id: speaker.id,
      username: speaker.username,
      gender: speaker.gender,
      age: speaker.age,
      statistics: speaker.statistics,
      gridsCount: speaker.grids.length,
      pictogramsCount: speaker.pictograms.length,
      sessionsCount: speaker.sessions.length,
    };

    return res.json(response);
  } catch (error) {
    console.error("Error fetching speaker dashboard:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
