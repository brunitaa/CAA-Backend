import { PictogramService } from "../services/pictogram.service.js";
import { serializeBigInt } from "../utils/serialize.js";

const pictogramService = new PictogramService();

export const createPictogram = async (req, res) => {
  try {
    const { name, posId } = req.body;
    const file = req.file;

    if (!name || !file || !posId) {
      return res
        .status(400)
        .json({ message: "Nombre, archivo y POS son obligatorios" });
    }

    // Aquí pasamos imageFile, no imageId
    const pictogram = await pictogramService.createPictogram(req.user, {
      name,
      imageFile: file, // <-- CORREGIDO
      posId: parseInt(posId),
    });

    res.status(201).json(serializeBigInt(pictogram));
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const updatePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    if (isNaN(pictogramId))
      return res.status(400).json({ message: "ID inválido" });

    const { name, posId } = req.body;
    const file = req.file;

    if (!name && !file && !posId) {
      return res
        .status(400)
        .json({ message: "Debe enviar nombre, imagen o POS" });
    }

    // Pasamos imageFile si existe
    const updated = await pictogramService.updatePictogram(
      req.user,
      pictogramId,
      {
        name,
        imageFile: file || undefined, // <- si no hay archivo, undefined
        posId: posId ? parseInt(posId) : undefined,
      }
    );

    res.json(serializeBigInt(updated));
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const deletePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    if (isNaN(pictogramId))
      return res.status(400).json({ message: "ID inválido" });

    const deleted = await pictogramService.softDeletePictogram(
      req.user,
      pictogramId
    );
    res.json(serializeBigInt(deleted));
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

import {
  attachFullImageUrl,
  attachFullImageUrlArray,
} from "../utils/serialize.js";

// Para todos los pictogramas
export const getAllPictograms = async (req, res) => {
  try {
    const pictograms = await pictogramService.getAllPictograms(req.user);
    const pictogramsWithUrl = attachFullImageUrlArray(pictograms);
    res.json(pictogramsWithUrl);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Para un solo pictograma
export const getPictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const pictogram = await pictogramService.getPictogramById(
      req.user,
      pictogramId
    );
    const pictogramWithUrl = attachFullImageUrl(pictogram);
    res.json(pictogramWithUrl);
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    if (err.message.includes("Pictograma no encontrado"))
      return res.status(404).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const assignPictogramToGrids = async (req, res) => {
  try {
    const { pictogramId, gridIds } = req.body;
    const result = await pictogramService.assignPictogramToGrids(
      req.user,
      pictogramId,
      gridIds
    );
    res.json(serializeBigInt(result));
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    if (err.message.includes("Grid") || err.message.includes("Pictograma"))
      return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
};
