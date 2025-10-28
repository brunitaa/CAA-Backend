import prisma from "../lib/prisma.js";

export const speakerPermissions = async (req, res, next) => {
  const userId = req.user.userId;

  const settings = await prisma.speakerSettings.findFirst({
    where: { speakerId: userId },
  });

  if (!settings || !settings.canEditPictograms)
    return res.status(403).json({ message: "No tiene permiso" });

  next();
};

// middleware para verificar que el usuario es un speaker válido
export const speakerCanCreateSentences = async (req, res, next) => {
  const userId = req.user.userId;

  console.log("Usuario intentando crear oración:", req.user);

  const isSpeaker = await prisma.caregiverSpeaker.findFirst({
    where: { speakerId: userId },
  });

  if (!isSpeaker) {
    return res
      .status(403)
      .json({ message: "No tiene permiso para crear oraciones" });
  }

  next();
};
