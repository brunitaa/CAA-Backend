import { SpeakerRepository } from "../repositories/speaker.repository.js";
import { signToken } from "../utils/jwt.js";

export class SpeakerService {
  constructor() {
    this.speakerRepo = new SpeakerRepository();
  }

  async createSpeaker({ username, gender, age }, caregiverId) {
    if (!gender) throw new Error("Gender is required");

    // Validar caregiver
    const caregiver = await this.speakerRepo.findById(caregiverId);
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    // Crear speaker
    const speaker = await this.speakerRepo.createSpeaker({
      username,
      gender,
      age,
    });

    // Asignar al caregiver
    await this.speakerRepo.assignToCaregiver(speaker.id, caregiverId);

    return {
      message: "Speaker creado y asignado al caregiver",
      speakerId: speaker.id,
    };
  }

  async selectSpeaker(caregiverId, speakerId) {
    const caregiver = await this.speakerRepo.findById(caregiverId);
    if (!caregiver || caregiver.roleId !== 2) throw new Error("No autorizado");

    const speaker = await this.speakerRepo.findById(speakerId);
    if (!speaker || speaker.roleId !== 3) throw new Error("Speaker no válido");

    // Crear sesión para speaker
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
