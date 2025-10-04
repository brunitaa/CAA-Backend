import { GridPictogramRepository } from "../repositories/gridPictogram.repository.js";
import { GridRepository } from "../repositories/grid.repository.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";
import prisma from "../lib/prisma.js";

const gridRepo = new GridRepository();
const pictogramRepo = new PictogramRepository();
const gridPictogramRepo = new GridPictogramRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

export class GridPictogramService {
  // Agregar pictogramas a grids (acepta arrays)
  async addPictogramToGrid(user, gridIdsInput, pictogramIdsInput) {
    const gridIds = Array.isArray(gridIdsInput) ? gridIdsInput : [gridIdsInput];
    const pictogramIds = Array.isArray(pictogramIdsInput)
      ? pictogramIdsInput
      : [pictogramIdsInput];

    // Validar grids
    const grids = [];
    for (const gridId of gridIds) {
      const grid = await gridRepo.findGridById(gridId);
      if (!grid || !grid.isActive) throw new Error(`Grid ${gridId} no válido`);
      grids.push(grid);
    }

    // Validar pictogramas
    const pictograms = [];
    for (const pictogramId of pictogramIds) {
      const pictogram = await pictogramRepo.findPictogramById(pictogramId);
      if (!pictogram || !pictogram.isActive)
        throw new Error(`Pictograma ${pictogramId} no encontrado`);
      pictograms.push(pictogram);
    }

    const results = [];

    for (const grid of grids) {
      for (const pictogram of pictograms) {
        // 🔒 Validación de permisos SOLO contra speakerId
        if (user.role === "caregiver") {
          const gridSpeakerId = grid.userId; // siempre es speakerId
          const pictogramSpeakerId = pictogram.userId; // siempre es speakerId

          const allowedGrid = await caregiverSpeakerRepo.exists(
            user.userId,
            gridSpeakerId
          );
          const allowedPictogram = await caregiverSpeakerRepo.exists(
            user.userId,
            pictogramSpeakerId
          );

          if (!allowedGrid || !allowedPictogram) {
            throw new Error(
              `No tienes permiso para agregar el ptictograma ${pictogram.id} al grid ${grid.id}`
            );
          }
        }

        // Verificar si ya existe
        const exists = await gridPictogramRepo.exists(grid.id, pictogram.id);
        if (exists) continue;

        // Obtener la posición siguiente
        const position = await gridPictogramRepo.getNextPosition(grid.id);

        const gp = await gridPictogramRepo.addPictogram(
          grid.id,
          pictogram.id,
          position
        );
        results.push(gp);
      }
    }

    return results;
  }

  async removePictogramFromGrid(user, gridId, pictogramId) {
    // Verificar si existe el pictograma
    const pictogram = await gridPictogramRepo.findPictogramById(pictogramId);
    if (!pictogram) {
      throw new Error(`Pictograma ${pictogramId} no encontrado`);
    }

    // Eliminar relación grid-pictograma
    return await prisma.gridPictogram.deleteMany({
      where: {
        gridId: Number(gridId),
        pictogramId: Number(pictogramId),
      },
    });
  }

  async listPictogramsByGrid(user, gridId) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "caregiver") {
      const gridSpeakerId = grid.userId;
      const allowed = await caregiverSpeakerRepo.exists(
        user.userId,
        gridSpeakerId
      );

      if (!allowed) throw new Error("No tienes permiso para ver este gridrrr");
    }

    return gridPictogramRepo.getPictogramsByGrid(gridId);
  }
}
