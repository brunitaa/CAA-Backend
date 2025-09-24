import { GridPictogramService } from "../services/gridPictogram.service.js";
import prisma from "../lib/prisma.js";
const service = new GridPictogramService();

// Agregar pictogramas a grids (acepta arrays)
export const addPictogramsToGrid = async (req, res) => {
  try {
    const { gridId, pictogramIds, speakerId } = req.body;

    // Validaciones básicas
    if (
      !gridId ||
      !Array.isArray(pictogramIds) ||
      pictogramIds.length === 0 ||
      !speakerId
    ) {
      return res
        .status(400)
        .json({ message: "gridId, pictogramIds y speakerId son requeridos" });
    }

    // Verificar que el grid exista
    const grid = await prisma.grid.findUnique({ where: { id: gridId } });
    if (!grid) return res.status(404).json({ message: "Grid no encontrado" });

    // Verificar que el speaker exista
    const speaker = await prisma.user.findUnique({ where: { id: speakerId } });
    if (!speaker)
      return res.status(404).json({ message: "Speaker no encontrado" });

    // Validar que el speaker pertenece al caregiver (req.user.userId)
    const caregiverId = req.user.userId;
    const relation = await prisma.caregiverSpeaker.findFirst({
      where: { caregiverId, speakerId },
    });
    if (!relation) {
      return res
        .status(403)
        .json({ message: "No autorizado para este speaker" });
    }

    // Verificar que todos los pictogramas existan
    const existingPictograms = await prisma.pictogram.findMany({
      where: { id: { in: pictogramIds } },
      select: { id: true },
    });
    const existingIds = existingPictograms.map((p) => p.id);
    const missingIds = pictogramIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length > 0) {
      return res.status(404).json({
        message: "Algunos pictogramas no existen",
        missingIds,
      });
    }

    // Preparar los datos para createMany
    const createData = pictogramIds.map((pictogramId, index) => ({
      gridId,
      pictogramId,
      position: index + 1,
    }));

    await prisma.gridPictogram.createMany({
      data: createData,
      skipDuplicates: true, // evita errores si el pictograma ya está en el grid
    });

    res.json({ message: "Pictogramas agregados correctamente" });
  } catch (err) {
    console.error("Error en addPictogramsToGrid:", err);
    res
      .status(500)
      .json({
        message: "Error agregando pictogramas al grid",
        error: err.message,
      });
  }
};

// Eliminar pictogramas de grids (acepta arrays)
export const removePictogramFromGrid = async (req, res) => {
  try {
    let { gridId, pictogramId } = req.body;

    // Normalizar a arrays
    const gridIds = Array.isArray(gridId) ? gridId : [gridId];
    const pictogramIds = Array.isArray(pictogramId)
      ? pictogramId
      : [pictogramId];

    const results = [];
    for (const gId of gridIds) {
      for (const pId of pictogramIds) {
        const result = await service.removePictogramFromGrid(
          req.user,
          gId,
          pId
        );
        results.push(result);
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

// Listar pictogramas por grid
export const listPictogramsByGrid = async (req, res) => {
  try {
    const { gridId } = req.params;
    const pictograms = await service.listPictogramsByGrid(
      req.user,
      parseInt(gridId)
    );
    res.json(pictograms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
