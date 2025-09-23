import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";

const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

/**
 * Verifica que el caregiver tenga relación con el speaker
 * @param {string} paramName Nombre del parámetro donde viene el speakerId (ej: "speakerId")
 */
export const verifyCaregiverSpeaker = (paramName = "speakerId") => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Si no es caregiver, dejamos pasar (admin u otros roles lo manejarán por separado)
      if (user.role !== "caregiver") return next();

      const speakerId = parseInt(req.body[paramName] || req.params[paramName]);
      if (!speakerId) {
        return res.status(400).json({ message: "Falta el speakerId" });
      }

      const relation = await caregiverSpeakerRepo.exists(
        user.userId,
        speakerId
      );
      if (!relation) {
        return res
          .status(403)
          .json({ message: "No tienes permiso sobre este speaker" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
