import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function validateCaregiver(req, res, next) {
  try {
    const caregiverId = req.user.id;
    const speakerId = parseInt(req.params.speakerId);

    const relation = await prisma.caregiverSpeaker.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });

    if (!relation) {
      return res
        .status(403)
        .json({ message: "No tienes permiso sobre este usuario" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export default validateCaregiver;
