import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";

export class SpeakerService {
  async createSpeaker({ username, gender, age }, caregiverId) {
    if (!gender) throw new Error("Gender is required");

    // Verificar que el usuario que crea sea caregiver
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    // Crear el speaker
    const speaker = await prisma.user.create({
      data: {
        username,
        gender,
        age: age || null,
        roleId: 3, // Speaker
        isActive: true,
      },
    });

    // Crear la relación caregiver → speaker
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
    if (!caregiver || !caregiver.roleId) throw new Error("No autorizado");

    const role = await prisma.role.findUnique({
      where: { id: caregiver.roleId },
    });
    if (role.name !== "caregiver")
      throw new Error("Solo caregivers pueden seleccionar speakers");

    const speaker = await prisma.user.findUnique({ where: { id: speakerId } });
    if (!speaker || !speaker.roleId) throw new Error("Speaker no válido");

    const speakerRole = await prisma.role.findUnique({
      where: { id: speaker.roleId },
    });
    if (speakerRole.name !== "speaker")
      throw new Error("Usuario seleccionado no es speaker");

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
}
