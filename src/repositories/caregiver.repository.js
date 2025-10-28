import prisma from "../lib/prisma.js";

export class CaregiverRepository {
  async assignSpeaker(caregiverId, speakerId) {
    return prisma.caregiverSpeaker.create({
      data: { caregiverId, speakerId },
    });
  }

  async getSpeakersByCaregiver(caregiverId) {
    return prisma.caregiverSpeaker.findMany({
      where: { caregiverId },
      include: { speaker: true },
    });
  }

  async exists(caregiverId, speakerId) {
    const record = await prisma.caregiverSpeaker.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });
    return !!record;
  }
}
