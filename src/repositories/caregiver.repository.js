import prisma from "../lib/prisma.js";

export class CaregiverRepository {
  // Asignar un Speaker a un Caregiver
  async assignSpeaker(caregiverId, speakerId) {
    return prisma.caregiverSpeaker.create({
      data: { caregiverId, speakerId },
    });
  }

  // Obtener Speakers asignados a un Caregiver
  async getSpeakersByCaregiver(caregiverId) {
    return prisma.caregiverSpeaker.findMany({
      where: { caregiverId },
      include: { speaker: true },
    });
  }

  // Verificar si un Caregiver ya tiene asignado un Speaker
  async exists(caregiverId, speakerId) {
    const record = await prisma.caregiverSpeaker.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });
    return !!record;
  }
}
