// services/grid.service.js
import { GridRepository } from "../repositories/grid.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";

const gridRepo = new GridRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

export class GridService {
  async createGrid(user, { name, description, speakerId }) {
    if (!name) throw new Error("El nombre del grid es requerido");

    if (user.role === "admin") {
      return gridRepo.createGrid({
        name,
        description,
        isGlobal: true,
        userId: null,
      });
    }

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
        isGlobal: false,
        userId: speakerId,
      });
    }

    throw new Error("Rol no autorizado para crear grids");
  }

  async getGrids(user) {
    if (user.role === "admin") return gridRepo.getAllGrids();
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

    if (user.role === "admin")
      return gridRepo.updateGrid(gridId, { name, description });

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

    if (user.role === "admin") return gridRepo.softDeleteGrid(gridId);

    if (user.role === "caregiver") {
      if (!grid.userId)
        throw new Error("No tienes permiso para eliminar grids globales");
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation)
        throw new Error("No tienes permiso para eliminar este grid");
      return gridRepo.softDeleteGrid(gridId);
    }

    throw new Error("Rol no autorizado para eliminar grids");
  }

  // Obtener grids archivados (isActive: false)
  async getArchivedGrids(user) {
    if (user.role === "admin") return gridRepo.getGridsByActiveStatus(false);

    if (user.role === "caregiver") {
      const speakers = await caregiverSpeakerRepo.getSpeakersByCaregiver(
        user.userId
      );
      const speakerIds = speakers.map((s) => s.speakerId);
      return gridRepo.getGridsByUserIdsAndStatus(speakerIds, false);
    }

    throw new Error("No autorizado para ver grids archivados");
  }

  // Restaurar grid (activar isActive)
  async restoreGrid(user, gridId) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid) throw new Error("Grid no encontrado");

    if (grid.isActive) return grid; // ya activo

    if (user.role === "admin")
      return gridRepo.updateGrid(gridId, { isActive: true });

    if (user.role === "caregiver") {
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation)
        throw new Error("No tienes permiso para restaurar este grid");
      return gridRepo.updateGrid(gridId, { isActive: true });
    }

    throw new Error("Rol no autorizado para restaurar grids");
  }
}
