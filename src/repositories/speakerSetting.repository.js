const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SpeakerSettingsRepository {
  async getSettings(caregiverId, speakerId) {
    return prisma.speakerSettings.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });
  }

  async createOrUpdateSettings(caregiverId, speakerId, data) {
    return prisma.speakerSettings.upsert({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
      update: data,
      create: { caregiverId, speakerId, ...data },
    });
  }
}

module.exports = SpeakerSettingsRepository;
