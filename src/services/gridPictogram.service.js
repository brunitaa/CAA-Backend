// services/gridPictogram.service.js
import { GridPictogramRepository } from "../repositories/gridPictogram.repository.js";
import { GridRepository } from "../repositories/grid.repository.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";

const gridRepo = new GridRepository();
const pictogramRepo = new PictogramRepository();
const gridPictogramRepo = new GridPictogramRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

export class GridPictogramService {
  async addPictogramToGrid(user, gridId, pictogramId) {
    const grid = await gridRepo.findGridById(gridId);
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);

    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    // Admin puede agregar cualquier pictograma a cualquier grid
    if (user.role === "admin") {
      const position = await gridPictogramRepo.getPosition(gridId);
      return gridPictogramRepo.addPictogram(gridId, pictogramId, position);
    }

    // Caregiver solo si controla el speaker dueño del grid y del pictograma
    if (user.role === "caregiver") {
      const caregiverGridRelation = await caregiverSpeakerRepo.exists(
        user.userId,
        grid.userId
      );
      const caregiverPictogramRelation = await caregiverSpeakerRepo.exists(
        user.userId,
        pictogram.userId
      );

      if (!caregiverGridRelation || !caregiverPictogramRelation) {
        throw new Error(
          "No tienes permiso para agregar este pictograma a este grid"
        );
      }

      const position = await gridPictogramRepo.getPosition(gridId);
      return gridPictogramRepo.addPictogram(gridId, pictogramId, position);
    }

    throw new Error("Rol no autorizado");
  }

  async removePictogramFromGrid(user, gridId, pictogramId) {
    const grid = await gridRepo.findGridById(gridId);
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);

    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "admin")
      return gridPictogramRepo.removePictogram(gridId, pictogramId);

    if (user.role === "caregiver") {
      const caregiverGridRelation = await caregiverSpeakerRepo.exists(
        user.userId,
        grid.userId
      );
      const caregiverPictogramRelation = await caregiverSpeakerRepo.exists(
        user.userId,
        pictogram.userId
      );

      if (!caregiverGridRelation || !caregiverPictogramRelation) {
        throw new Error(
          "No tienes permiso para eliminar este pictograma de este grid"
        );
      }

      return gridPictogramRepo.removePictogram(gridId, pictogramId);
    }

    throw new Error("Rol no autorizado");
  }

  async listPictogramsByGrid(user, gridId) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "admin")
      return gridPictogramRepo.getPictogramsByGrid(gridId);

    if (user.role === "caregiver") {
      const caregiverGridRelation = await caregiverSpeakerRepo.exists(
        user.userId,
        grid.userId
      );
      if (!caregiverGridRelation)
        throw new Error("No tienes permiso para ver este grid");
      return gridPictogramRepo.getPictogramsByGrid(gridId);
    }

    throw new Error("Rol no autorizado");
  }
}
