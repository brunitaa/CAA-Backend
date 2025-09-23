// controllers/pictogram.controller.js
import { PictogramService } from "../services/pictogram.service.js";
import { ImageRepository } from "../repositories/image.repository.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { serializeBigInt } from "../utils/serialize.js";

const pictogramService = new PictogramService();
const imageRepo = new ImageRepository();
const pictogramRepo = new PictogramRepository();

/**
 * Crear pictograma con imagen
 */
export const createPictogram = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res
        .status(400)
        .json({ message: "Nombre y archivo son requeridos" });
    }

    // Guardar imagen
    const image = await imageRepo.createImage({
      url: `/uploads/images/${file.filename}`,
      filesize: file.size,
      mimeType: file.mimetype,
      userId: req.user.userId,
    });

    // Crear pictograma
    const pictogram = await pictogramRepo.createPictogram({
      name,
      imageId: image.id,
      createdBy: req.user.userId,
    });

    res.status(201).json(serializeBigInt(pictogram));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Editar pictograma
 */
export const updatePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const { name } = req.body; // campo de texto
    const file = req.file; // archivo subido

    if (!name && !file) {
      return res.status(400).json({ message: "Debe enviar nombre o imagen" });
    }

    const updated = await pictogramService.updatePictogram(
      req.user,
      pictogramId,
      { name, imageFile: file }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Soft delete de pictograma
export const deletePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const deleted = await pictogramService.softDeletePictogram(pictogramId);
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Asignar pictograma a uno o varios grids
 */
export const assignPictogramToGrids = async (req, res) => {
  try {
    const { pictogramId, gridIds } = req.body;
    const result = await pictogramService.assignPictogramToGrids(
      pictogramId,
      gridIds
    );
    res.json(serializeBigInt(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Obtener un pictograma por ID
 */
export const getPictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const pictogram = await pictogramService.getPictogram(pictogramId);
    res.json(serializeBigInt(pictogram));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Obtener todos los pictogramas
 */
export const getAllPictograms = async (req, res) => {
  try {
    const pictograms = await pictogramService.getAllPictograms();
    res.json(serializeBigInt(pictograms));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
