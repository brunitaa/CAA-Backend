import { GridPictogramService } from "../services/gridPictogram.service.js";
import prisma from "../lib/prisma.js";
import { GridPictogramRepository } from "../repositories/gridPictogram.repository.js";

const gridPictogramRepo = new GridPictogramRepository();
const service = new GridPictogramService();

export const addPictogramsToGrid = async (req, res) => {
  try {
    let { gridId, pictogramIds, speakerId } = req.body;
    const gridIdInt = Number(gridId);
    if (isNaN(gridIdInt)) {
      return res.status(400).json({ message: "gridId inválido" });
    }
    const pictogramIdsArray = Array.isArray(pictogramIds)
      ? pictogramIds.map((id) => Number(id))
      : [Number(pictogramIds)];

    if (!speakerId || pictogramIdsArray.some(isNaN)) {
      return res
        .status(400)
        .json({ message: "speakerId y pictogramIds válidos son requeridos" });
    }

    const grid = await prisma.grid.findUnique({ where: { id: gridIdInt } });
    if (!grid) return res.status(404).json({ message: "Grid no encontrado" });

    const speaker = await prisma.user.findUnique({
      where: { id: Number(speakerId) },
    });
    if (!speaker)
      return res.status(404).json({ message: "Speaker no encontrado" });

    const caregiverId = req.user.userId;
    const relation = await prisma.caregiverSpeaker.findFirst({
      where: { caregiverId, speakerId: Number(speakerId) },
    });
    if (!relation)
      return res
        .status(403)
        .json({ message: "No autorizado para este speaker" });

    const existingPictograms = await prisma.pictogram.findMany({
      where: { id: { in: pictogramIdsArray } },
      select: { id: true },
    });
    const existingIds = existingPictograms.map((p) => p.id);
    const missingIds = pictogramIdsArray.filter(
      (id) => !existingIds.includes(id)
    );
    if (missingIds.length > 0) {
      return res
        .status(404)
        .json({ message: "Algunos pictogramas no existen", missingIds });
    }

    await service.addPictogramToGrid(req.user, gridIdInt, pictogramIdsArray);
    res.json({ message: "Pictogramas agregados correctamente" });
  } catch (err) {
    res.status(500).json({
      message: "Error agregando pictogramas al grid",
      error: err.message,
    });
  }
};

export const addPictogramsToGridAdmin = async (req, res) => {
  try {
    let { gridId, pictogramIds } = req.body;
    if (!gridId || !pictogramIds) {
      return res
        .status(400)
        .json({ message: "gridId y pictogramIds son requeridos" });
    }

    const gridIdInt = Number(gridId);
    if (isNaN(gridIdInt))
      return res.status(400).json({ message: "gridId inválido" });

    const pictogramIdsArray = Array.isArray(pictogramIds)
      ? pictogramIds.map((id) => Number(id))
      : [Number(pictogramIds)];

    if (pictogramIdsArray.some(isNaN)) {
      return res
        .status(400)
        .json({ message: "Algunos pictogramIds son inválidos" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const grid = await prisma.grid.findUnique({ where: { id: gridIdInt } });
    if (!grid) return res.status(404).json({ message: "Grid no encontrado" });

    // Validar que existan los pictogramas
    const existingPictograms = await prisma.pictogram.findMany({
      where: { id: { in: pictogramIdsArray } },
      select: { id: true },
    });
    const existingIds = existingPictograms.map((p) => p.id);
    const missingIds = pictogramIdsArray.filter(
      (id) => !existingIds.includes(id)
    );
    if (missingIds.length > 0) {
      return res
        .status(404)
        .json({ message: "Algunos pictogramas no existen", missingIds });
    }

    const results = [];
    for (const pictogramId of pictogramIdsArray) {
      // Obtener la siguiente posición disponible
      const position = await gridPictogramRepo.getNextPosition(gridIdInt);

      console.log(
        `Agregando pictograma ${pictogramId} a grid ${gridIdInt} en posición ${position}`
      );

      const gp = await gridPictogramRepo.addPictogram(
        gridIdInt,
        pictogramId,
        position
      );
      results.push(gp);
    }

    // Reordenar pictogramas según part of speech
    await service.orderGridPictograms(gridIdInt);

    res.json({ message: "Pictogramas agregados correctamente", data: results });
  } catch (err) {
    console.error("Error agregando pictogramas:", err);
    res.status(500).json({
      message: "Error agregando pictogramas al grid",
      error: err.message,
    });
  }
};

export const removePictogramFromGrid = async (req, res) => {
  try {
    let { gridId, pictogramId } = req.body;
    if (!gridId || !pictogramId) {
      return res
        .status(400)
        .json({ message: "gridId y pictogramId son requeridos" });
    }

    const gridIds = Array.isArray(gridId)
      ? gridId.map(Number)
      : [Number(gridId)];
    const pictogramIds = Array.isArray(pictogramId)
      ? pictogramId.map(Number)
      : [Number(pictogramId)];

    const results = [];
    for (const gId of gridIds) {
      for (const pId of pictogramIds) {
        results.push(await service.removePictogramFromGrid(req.user, gId, pId));
      }
    }

    res.json({
      message: "Pictogramas eliminados correctamente",
      data: results,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listPictogramsByGrid = async (req, res) => {
  try {
    const gridId = Number(req.params.gridId);
    if (isNaN(gridId))
      return res.status(400).json({ message: "gridId inválido" });

    const pictograms = await service.listPictogramsByGrid(req.user, gridId);
    res.json(pictograms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const orderGridPictograms = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const result = await service.orderGridPictograms(gridId);
    res.json({
      message: "Pictogramas ordenados automáticamente",
      data: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al ordenar pictogramas", error: err.message });
  }
};
