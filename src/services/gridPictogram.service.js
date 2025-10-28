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
  async addPictogramToGrid(
    user,
    gridIdsInput,
    pictogramIdsInput,
    positionInput = null
  ) {
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

        // Validar permisos caregiver
        if (user.role === "caregiver") {
          const allowedGrid = await caregiverSpeakerRepo.exists(
            user.userId,
            grid.userId
          );
          if (!allowedGrid)
            throw new Error(
              `No tienes permiso para agregar pictogramas al grid ${grid.name}`
            );
        }

        // Si pictograma global y usuario es caregiver → crear copia personalizada
        let pictogramIdToUse = pictogram.id;
        if (!pictogram.userId && user.role === "caregiver") {
          const copy = await prisma.pictogram.create({
            data: {
              name: pictogram.name,
              imageId: pictogram.imageId,
              userId: grid.userId, // pertenece al speaker
              createdBy: user.userId,
              originalId: pictogram.id,
              isActive: true,
            },
          });
          pictogramIdToUse = copy.id;
        }

        // Verificar si ya existe en el grid
        const exists = await gridPictogramRepo.exists(
          grid.id,
          pictogramIdToUse
        );
        if (exists) continue;

        // Obtener siguiente posición
        let position = await gridPictogramRepo.getNextPosition(grid.id);

        // Si se especifica posición, desplazar los existentes
        if (positionInput) {
          await prisma.gridPictogram.updateMany({
            where: { gridId: grid.id, position: { gte: positionInput } },
            data: { position: { increment: 1 } },
          });
          position = positionInput;
        }

        const gp = await gridPictogramRepo.addPictogram(
          grid.id,
          pictogramIdToUse,
          position
        );
        results.push(gp);
      }

      // Reordenar pictogramas del grid por POS
      await this.orderGridPictograms(grid.id);
    }

    return results;
  }

  async orderGridPictograms(gridIdInput) {
    const gridId = Number(gridIdInput);
    if (isNaN(gridId)) throw new Error("gridId inválido");

    // Obtener todos los pictogramas del grid con sus relaciones necesarias
    const pictograms = await prisma.gridPictogram.findMany({
      where: { gridId },
      include: {
        pictogram: {
          include: { pictogramPos: { include: { pos: true } }, image: true },
        },
      },
    });

    // Ordenar según prioridad de POS
    const ordered = pictograms.sort((a, b) => {
      const posA = a.pictogram.pictogramPos[0]?.pos.code || "noun";
      const posB = b.pictogram.pictogramPos[0]?.pos.code || "noun";
      return getPriorityByPartOfSpeech(posA) - getPriorityByPartOfSpeech(posB);
    });

    // 🔹 Paso 1: asignar posiciones temporales negativas para evitar conflictos
    await prisma.$transaction(
      ordered.map((gp, index) =>
        prisma.gridPictogram.update({
          where: { id: gp.id },
          data: { position: -(index + 1) },
        })
      )
    );
    await prisma.$transaction(
      ordered.map((gp, index) =>
        prisma.gridPictogram.update({
          where: { id: gp.id },
          data: { position: index + 1 },
        })
      )
    );

    return ordered;
  }

  async removePictogramFromGrid(user, gridIdInput, pictogramIdInput) {
    const gridId = Number(gridIdInput);
    const pictogramId = Number(pictogramIdInput);

    const grid = await gridRepo.findGridById(gridId);
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);

    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver") {
      const allowed = await caregiverSpeakerRepo.exists(
        user.userId,
        grid.userId
      );
      if (!allowed)
        throw new Error("No tienes permiso para modificar este grid");
    }

    return await prisma.gridPictogram.deleteMany({
      where: { gridId, pictogramId },
    });
  }

  async listPictogramsByGrid(user, gridIdInput) {
    const gridId = Number(gridIdInput);
    const grid = await gridRepo.findGridById(gridId);

    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "caregiver" && grid.userId) {
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
        isGlobal: !gp.pictogram.userId,
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
