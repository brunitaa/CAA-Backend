// controllers/grid.controller.js
import { GridService } from "../services/grid.service.js";

const gridService = new GridService();

export const createGrid = async (req, res) => {
  try {
    const result = await gridService.createGrid(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
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
    res.status(404).json({ message: err.message });
  }
};

export const updateGrid = async (req, res) => {
  try {
    const gridId = parseInt(req.params.id);
    if (isNaN(gridId)) return res.status(400).json({ message: "ID inválido" });

    const updated = await gridService.updateGrid(req.user, gridId, req.body);
    res.json(updated);
  } catch (err) {
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
    res.status(400).json({ message: err.message });
  }
};
