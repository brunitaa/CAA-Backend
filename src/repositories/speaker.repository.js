import prisma from "../lib/prisma.js";

export class SpeakerRepository {
  async createSpeaker({ username, gender, age, roleId = 3, isActive = true }) {
    return prisma.user.create({
      data: { username, gender, age, roleId, isActive },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async assignToCaregiver(speakerId, caregiverId) {
    return prisma.caregiverSpeaker.create({
      data: { speakerId, caregiverId },
    });
  }
}
