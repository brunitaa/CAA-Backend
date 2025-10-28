import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";

export class SpeakerService {
  async createSpeaker({ username, gender, age }, caregiverId) {
    if (!username) throw new Error("username es requerido");
    if (!gender) throw new Error("gender es requerido");

    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    const speaker = await prisma.user.create({
      data: {
        username,
        gender,
        age,
        roleId: 3,
        isActive: true,
      },
    });

    await prisma.caregiverSpeaker.create({
      data: {
        caregiverId,
        speakerId: speaker.id,
      },
    });

    return {
      message: "Speaker creado y asignado al caregiver",
      speakerId: speaker.id,
    };
  }

  async selectSpeaker(caregiverId, speakerId) {
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    const speaker = await prisma.user.findUnique({ where: { id: speakerId } });
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

    return { token, sessionId: session.id };
  }

  async getSpeakerProfile(speakerId) {
    const speaker = await prisma.user.findUnique({
      where: { id: speakerId },
      include: {
        role: true,
        grids: {
          where: { isActive: true },
          include: {
            gridPictograms: {
              include: {
                pictogram: {
                  select: { id: true, name: true, imageId: true },
                },
              },
            },
          },
        },
        statistics: true,
      },
    });

    if (!speaker || speaker.role.name.toLowerCase() !== "speaker") {
      throw new Error("Perfil de speaker no encontrado o inválido");
    }

    const grids = speaker.grids.map((grid) => ({
      id: grid.id,
      name: grid.name,
      pictograms: grid.gridPictograms.map((gp) => gp.pictogram),
    }));

    return {
      id: speaker.id,
      username: speaker.username,
      gender: speaker.gender,
      age: speaker.age,
      statistics: speaker.statistics,
      grids,
    };
  }

  async getSpeakersByCaregiver(caregiverId) {
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

    return relations.map((r) => r.speaker);
  }
}
