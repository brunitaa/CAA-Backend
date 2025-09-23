// services/grid.service.js
import { GridRepository } from "../repositories/grid.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";

const gridRepo = new GridRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

export class GridService {
  async createGrid(user, { name, description, speakerId }) {
    if (!name) throw new Error("El nombre del grid es requerido");

    // Admin: crea grid global
    if (user.role === "admin") {
      return gridRepo.createGrid({
        name,
        description,
        userId: user.userId, // Admin como creador
        isGlobal: true,
      });
    }

    // Caregiver: crea grid solo para sus speakers
    if (user.role === "caregiver") {
      if (!speakerId) throw new Error("Se requiere speakerId para caregiver");

      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        speakerId
      );
      if (!relation)
        throw new Error("No puedes crear un grid para este speaker");

      return gridRepo.createGrid({
        name,
        description,
        userId: speakerId,
        isGlobal: false,
      });
    }

    throw new Error("No autorizado para crear grids");
  }

  async getGrids(user) {
    if (user.role === "admin") {
      return gridRepo.getAllGrids();
    }

    if (user.role === "caregiver") {
      const speakers = await caregiverSpeakerRepo.getSpeakersByCaregiver(
        user.userId
      );
      const speakerIds = speakers.map((s) => s.speakerId);
      return gridRepo.getGridsByUserIds(speakerIds);
    }

    throw new Error("No autorizado para ver grids");
  }

  async getGridById(user, gridId) {
    if (!gridId) throw new Error("ID del grid requerido");

    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    // Caregiver solo puede ver grids de sus speakers
    if (user.role === "caregiver") {
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation) throw new Error("No tienes permiso para ver este grid");
    }

    return grid;
  }

  async updateGrid(user, gridId, { name, description }) {
    if (!gridId) throw new Error("ID del grid requerido");

    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    // Admin puede actualizar cualquier grid
    if (user.role === "admin") {
      return gridRepo.updateGrid(gridId, { name, description });
    }

    // Caregiver solo sus grids
    if (user.role === "caregiver") {
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation) throw new Error("No puedes actualizar este grid");

      return gridRepo.updateGrid(gridId, { name, description });
    }

    throw new Error("Rol no autorizado para actualizar grids");
  }

  async deleteGrid(user, gridId) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid) throw new Error("Grid no encontrado");

    // Admin
    if (user.role === "admin") {
      // Puede borrar cualquier grid (o solo globales si quieres)
      return gridRepo.softDeleteGrid(gridId);
    }

    // Caregiver
    if (user.role === "caregiver") {
      // Si el grid es global, no puede borrarlo
      if (!grid.userId) {
        throw new Error("No tienes permiso para eliminar grids globales");
      }

      // Verificar relación caregiver ↔ speaker
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation) {
        throw new Error("No tienes permiso para eliminar este grid");
      }

      return gridRepo.softDeleteGrid(gridId);
    }

    throw new Error("Rol no autorizado para eliminar grids");
  }
}
