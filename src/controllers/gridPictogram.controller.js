import { GridPictogramService } from "../services/gridPictogram.service.js";

const service = new GridPictogramService();

const handleError = (err, res) => {
  if (err.message.includes("permiso"))
    return res.status(403).json({ message: err.message });
  if (err.message.includes("no encontrado"))
    return res.status(404).json({ message: err.message });
  res.status(400).json({ message: err.message });
};

// Agregar pictogramas a grid (caregiver y admin)
export const addPictogramsToGrid = async (req, res) => {
  try {
    const { gridId, pictogramIds } = req.body;
    const results = await service.addPictogramToGrid(
      req.user,
      gridId,
      pictogramIds
    );
    res.json({ message: "Pictogramas agregados correctamente", data: results });
  } catch (err) {
    handleError(err, res);
  }
};

export const addPictogramsToGridAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      throw new Error("No tienes permiso para realizar esta acción");

    const { gridId, pictogramIds } = req.body;
    const results = await service.addPictogramToGrid(
      req.user,
      gridId,
      pictogramIds
    );
    res.json({
      message: "Pictogramas agregados correctamente por admin",
      data: results,
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Remover pictogramas de grid
export const removePictogramFromGrid = async (req, res) => {
  try {
    const { gridId, pictogramId } = req.body;
    const results = await service.removePictogramFromGrid(
      req.user,
      gridId,
      pictogramId
    );
    res.json({
      message: "Pictogramas eliminados correctamente",
      data: results,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const listPictogramsByGrid = async (req, res) => {
  try {
    const gridId = Number(req.params.gridId);

    if (isNaN(gridId)) {
      return res.status(400).json({ message: "gridId inválido" });
    }

    const pictograms = await service.listPictogramsByGrid(req.user, gridId);

    res.json(pictograms);
  } catch (err) {
    handleError(err, res);
  }
};

export const orderGridPictograms = async (req, res) => {
  try {
    const gridId = Number(req.params.id);
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
