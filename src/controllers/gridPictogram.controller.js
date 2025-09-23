// controllers/gridPictogram.controller.js
import { GridPictogramService } from "../services/gridPictogram.service.js";

const service = new GridPictogramService();

export const addPictogramToGrid = async (req, res) => {
  try {
    const { gridId, pictogramId } = req.body;
    const result = await service.addPictogramToGrid(
      req.user,
      gridId,
      pictogramId
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removePictogramFromGrid = async (req, res) => {
  try {
    const { gridId, pictogramId } = req.body;
    const result = await service.removePictogramFromGrid(
      req.user,
      gridId,
      pictogramId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
