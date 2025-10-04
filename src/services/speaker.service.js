import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";

export class SpeakerService {
  // Crear speaker y asignarlo a un caregiver
  async createSpeaker({ username, gender, age }, caregiverId) {
    if (!username) throw new Error("username es requerido");
    if (!gender) throw new Error("gender es requerido");

    // Validar caregiver
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    // Crear speaker
    const speaker = await prisma.user.create({
      data: {
        username,
        gender,
        age,
        roleId: 3, // speaker
        isActive: true, // activo desde creación
      },
    });

    // Asignar al caregiver
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

  // Seleccionar speaker y generar token/session
  async selectSpeaker(caregiverId, speakerId) {
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    const speaker = await prisma.user.findUnique({ where: { id: speakerId } });
    if (!speaker || speaker.roleId !== 3) throw new Error("Speaker no válido");

    // Validar relación caregiver-speaker
    const relation = await prisma.caregiverSpeaker.findUnique({
      where: { caregiverId_speakerId: { caregiverId, speakerId } },
    });
    if (!relation) throw new Error("El speaker no pertenece a este caregiver");

    // Crear sesión
    const session = await prisma.userSession.create({
      data: { userId: speaker.id },
    });

    // Generar token JWT
    const token = signToken({
      userId: speaker.id,
      role: "speaker",
      username: speaker.username,
    });

    return { token, sessionId: session.id };
  }

  // Obtener todos los speakers de un caregiver
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
