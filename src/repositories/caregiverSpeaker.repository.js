// repositories/caregiverSpeaker.repository.js
import prisma from "../lib/prisma.js";

export class CaregiverSpeakerRepository {
  async exists(caregiverId, speakerId) {
    const record = await prisma.caregiverSpeaker.findUnique({
      where: {
        caregiverId_speakerId: { caregiverId, speakerId },
      },
    });
    return !!record;
  }
  /**
   * Verifica si un caregiver controla un speaker específico
   * @param {number} caregiverId
   * @param {number} speakerId
   * @returns {Promise<Object|null>} relación o null
   */
  async findRelation(caregiverId, speakerId) {
    return prisma.caregiverSpeaker.findUnique({
      where: {
        caregiverId_speakerId: {
          caregiverId,
          speakerId,
        },
      },
    });
  }

  /**
   * Obtiene todos los speakers asociados a un caregiver
   * @param {number} caregiverId
   * @returns {Promise<Array>} lista de relaciones
   */
  async getSpeakersByCaregiver(caregiverId) {
    return prisma.caregiverSpeaker.findMany({
      where: { caregiverId },
      include: { speaker: true }, // incluye info del speaker
    });
  }

  /**
   * Crear relación caregiver ↔ speaker
   * @param {number} caregiverId
   * @param {number} speakerId
   */
  async createRelation(caregiverId, speakerId) {
    return prisma.caregiverSpeaker.create({
      data: { caregiverId, speakerId },
    });
  }

  /**
   * Eliminar relación caregiver ↔ speaker
   * @param {number} caregiverId
   * @param {number} speakerId
   */
  async deleteRelation(caregiverId, speakerId) {
    return prisma.caregiverSpeaker.delete({
      where: {
        caregiverId_speakerId: { caregiverId, speakerId },
      },
    });
  }
}
