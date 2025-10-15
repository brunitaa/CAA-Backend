import { GridPictogramRepository } from "../repositories/gridPictogram.repository.js";
import { GridRepository } from "../repositories/grid.repository.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";
import prisma from "../lib/prisma.js";

const gridRepo = new GridRepository();
const pictogramRepo = new PictogramRepository();
const gridPictogramRepo = new GridPictogramRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

const getPriorityByPartOfSpeech = (pos) => {
  const priorityMap = { noun: 1, verb: 2, adjective: 3, adverb: 4 };
  return priorityMap[pos] || 99;
};

export class GridPictogramService {
  async addPictogramToGrid(user, gridIdsInput, pictogramIdsInput) {
    const gridIds = Array.isArray(gridIdsInput) ? gridIdsInput : [gridIdsInput];
    const pictogramIds = Array.isArray(pictogramIdsInput)
      ? pictogramIdsInput
      : [pictogramIdsInput];

    const results = [];

    for (const gridId of gridIds) {
      const grid = await gridRepo.findGridById(Number(gridId));
      if (!grid || !grid.isActive) throw new Error(`Grid ${gridId} no válido`);

      for (const pictogramId of pictogramIds) {
        const pictogram = await pictogramRepo.findPictogramById(
          Number(pictogramId)
        );
        if (!pictogram || !pictogram.isActive)
          throw new Error(`Pictograma ${pictogramId} no encontrado`);

        // permisos caregiver
        if (user.role === "caregiver") {
          const allowedGrid = await caregiverSpeakerRepo.exists(
            user.userId,
            grid.userId
          );
          const allowedPictogram = await caregiverSpeakerRepo.exists(
            user.userId,
            pictogram.userId
          );
          if (!allowedGrid || !allowedPictogram)
            throw new Error(
              `No tienes permiso para agregar ${pictogram.id} al grid ${grid.id}`
            );
        }

        // verificar si ya existe
        const exists = await gridPictogramRepo.exists(grid.id, pictogram.id);
        if (exists) continue;

        // obtener la siguiente posición
        const position = await gridPictogramRepo.getNextPosition(grid.id);

        console.log(
          `Agregando pictograma ${pictogram.id} al grid ${grid.id} en posición ${position}`
        );

        const gp = await gridPictogramRepo.addPictogram(
          grid.id,
          pictogram.id,
          position
        );
        results.push(gp);
      }

      // reordenar después de agregar
      await this.orderGridPictograms(grid.id);
    }

    console.log("Resultados finales:", results);
    return results;
  }

  async orderGridPictograms(gridIdInput) {
    const gridId = Number(gridIdInput);
    if (isNaN(gridId)) throw new Error("gridId inválido");

    const pictograms = await prisma.gridPictogram.findMany({
      where: { gridId },
      include: {
        pictogram: {
          include: { pictogramPos: { include: { pos: true } }, image: true },
        },
      },
    });

    const ordered = pictograms.sort((a, b) => {
      const posA = a.pictogram.pictogramPos[0]?.pos.code || "noun";
      const posB = b.pictogram.pictogramPos[0]?.pos.code || "noun";
      return getPriorityByPartOfSpeech(posA) - getPriorityByPartOfSpeech(posB);
    });

    // Primer paso: asignar posiciones negativas para evitar colisiones
    for (let i = 0; i < ordered.length; i++) {
      await prisma.gridPictogram.update({
        where: { id: ordered[i].id },
        data: { position: -(i + 1) },
      });
    }

    // Segundo paso: reasignar posiciones correctas 1..N
    for (let i = 0; i < ordered.length; i++) {
      await prisma.gridPictogram.update({
        where: { id: ordered[i].id },
        data: { position: i + 1 },
      });
    }

    return ordered;
  }

  async removePictogramFromGrid(user, gridId, pictogramId) {
    const pictogram = await gridPictogramRepo.findPictogramById(pictogramId);
    if (!pictogram) throw new Error(`Pictograma ${pictogramId} no encontrado`);

    return await prisma.gridPictogram.deleteMany({
      where: {
        gridId: Number(gridId),
        pictogramId: Number(pictogramId),
      },
    });
  }

  async listPictogramsByGrid(user, gridIdInput) {
    const gridId = Number(gridIdInput);
    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "caregiver") {
      const allowed = await caregiverSpeakerRepo.exists(
        user.userId,
        grid.userId
      );
      if (!allowed) throw new Error("No tienes permiso para ver este grid");
    }

    const pictograms = await prisma.gridPictogram.findMany({
      where: { gridId },
      include: {
        pictogram: {
          include: { pictogramPos: { include: { pos: true } }, image: true },
        },
      },
      orderBy: { position: "asc" },
    });

    return pictograms.map((gp) => ({
      id: gp.id,
      boardName: grid.name,
      position: gp.position,
      pictogram: {
        id: gp.pictogram.id,
        name: gp.pictogram.name,
        userId: gp.pictogram.userId,
        image: gp.pictogram.image
          ? { url: gp.pictogram.image.url, fullUrl: gp.pictogram.image.url }
          : null,
      },
      pictogramPos: gp.pictogram.pictogramPos.map((pp) => ({
        pos: {
          id: pp.pos.id,
          name: pp.pos.name,
          color: pp.pos.color,
        },
        isPrimary: pp.isPrimary,
      })),
    }));
  }
}
