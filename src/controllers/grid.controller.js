// controllers/grid.controller.js
import { GridService } from "../services/grid.service.js";

const gridService = new GridService();

export const createGrid = async (req, res) => {
  try {
    const { name, description, speakerId } = req.body;
    const result = await gridService.createGrid(req.user, {
      name,
      description,
      speakerId,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes("No autorizado") || err.message.includes("rol"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const getGrids = async (req, res) => {
  try {
    const grids = await gridService.getGrids(req.user);
    res.json(grids);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getGridById = async (req, res) => {
  try {
    const gridId = parseInt(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const grid = await gridService.getGridById(req.user, gridId);
    res.json(grid);
  } catch (err) {
    if (
      err.message.includes("no encontrado") ||
      err.message.includes("permiso")
    )
      return res.status(404).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const updateGrid = async (req, res) => {
  try {
    const gridId = parseInt(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const { name, description } = req.body;
    const updated = await gridService.updateGrid(req.user, gridId, {
      name,
      description,
    });
    res.json(updated);
  } catch (err) {
    if (err.message.includes("permiso") || err.message.includes("rol"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const deleteGrid = async (req, res) => {
  try {
    const gridId = parseInt(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const deleted = await gridService.deleteGrid(req.user, gridId);
    res.json(deleted);
  } catch (err) {
    if (err.message.includes("permiso") || err.message.includes("rol"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

// Obtener grids archivados
export const getArchivedGrids = async (req, res) => {
  try {
    const archived = await gridService.getArchivedGrids(req.user);
    res.json(archived);
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

// Restaurar grid
export const restoreGrid = async (req, res) => {
  try {
    const gridId = parseInt(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const restored = await gridService.restoreGrid(req.user, gridId);
    res.json(restored);
  } catch (err) {
    if (err.message.includes("permiso") || err.message.includes("rol"))
      return res.status(403).json({ message: err.message });
    if (err.message.includes("no encontrado"))
      return res.status(404).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};
