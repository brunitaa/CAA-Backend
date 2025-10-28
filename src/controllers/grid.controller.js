import { GridService } from "../services/grid.service.js";

const gridService = new GridService();

const handleError = (err, res) => {
  if (err.message.includes("permiso") || err.message.includes("rol"))
    return res.status(403).json({ message: err.message });
  if (err.message.includes("no encontrado"))
    return res.status(404).json({ message: err.message });
  res.status(400).json({ message: err.message });
};

export const createGrid = async (req, res) => {
  try {
    const { name, description, speakerId } = req.body;
    const result = await gridService.createGrid(req.user, speakerId, {
      name,
      description,
    });
    res.status(201).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getGrids = async (req, res) => {
  try {
    const speakerId = req.query.speakerId
      ? Number(req.query.speakerId)
      : undefined;

    const grids = await gridService.getAllGrids(req.user, speakerId);
    res.json(grids);
  } catch (err) {
    handleError(err, res);
  }
};

export const getGridById = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
    if (isNaN(gridId)) throw new Error("ID inválido");
    const grid = await gridService.getGridById(req.user, gridId);
    res.json(grid);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateGrid = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
    const { name, description } = req.body;
    const updated = await gridService.updateGrid(req.user, gridId, {
      name,
      description,
    });
    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteGrid = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
    const deleted = await gridService.deleteGrid(req.user, gridId);
    res.json(deleted);
  } catch (err) {
    handleError(err, res);
  }
};

export const getArchivedGrids = async (req, res) => {
  try {
    const speakerId = req.query.speakerId
      ? Number(req.query.speakerId)
      : undefined;

    const archived = await gridService.getArchivedGrids(req.user, speakerId);
    res.json(archived);
  } catch (err) {
    handleError(err, res);
  }
};

// Restaurar grid
export const restoreGrid = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
    const restored = await gridService.restoreGrid(req.user, gridId);
    res.json(restored);
  } catch (err) {
    handleError(err, res);
  }
};
