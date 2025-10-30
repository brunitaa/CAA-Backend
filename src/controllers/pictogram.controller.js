import { PictogramService } from "../services/pictogram.service.js";
import { PosService } from "../services/pos.service.js";

const pictogramService = new PictogramService();
const posService = new PosService();

export const createPictogram = async (req, res) => {
  try {
    const { name, posId, targetUserId } = req.body;
    const imageFile = req.file;

    const pictogram = await pictogramService.createPictogram(
      req.user,
      targetUserId ? parseInt(targetUserId) : null,
      {
        name,
        imageFile,
        posId: parseInt(posId),
      }
    );

    res.status(201).json({
      message: "Pictograma creado exitosamente.",
      pictogram,
    });
  } catch (err) {
    console.error("Error en createPictogram:", err);
    res.status(400).json({ message: err.message });
  }
};

export const updatePictogramAdmin = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const { name, posId } = req.body || {};
    const imageFile = req.file;

    const parsedPosId = posId ? parseInt(posId, 10) : undefined;

    const pictogram = await pictogramService.updatePictogramAdmin(
      req.user,
      pictogramId,
      {
        name: name || undefined,
        posId: parsedPosId,
        imageFile,
      }
    );

    res.json({
      message: "Pictograma global actualizado correctamente.",
      pictogram,
    });
  } catch (err) {
    console.error("Error en updatePictogramAdmin:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getPictogramsML = async (req, res) => {
  try {
    const speakerId = parseInt(req.params.id, 10);
    console.log("Pictogram ID recibido:", speakerId);

    const pictograms = await pictogramService.getAllPictogramsForModel(
      speakerId
    );
    res.json(pictograms);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

export const updatePictogramByCaregiver = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id, 10);
    console.log("Pictogram ID recibido:", pictogramId);

    if (isNaN(pictogramId))
      return res.status(400).json({ message: "ID de pictograma inválido" });

    const { name, posId, speakerId } = req.body || {};
    const imageFile = req.file;
    const parsedPosId = posId ? parseInt(posId, 10) : undefined;

    if (!req.user?.userId)
      return res.status(400).json({ message: "Usuario no válido" });

    if (!speakerId)
      return res
        .status(400)
        .json({ message: "Debes indicar el ID del speaker" });

    const pictogram = await pictogramService.updatePictogramCaregiver(
      req.user,
      pictogramId,
      { name, posId: parsedPosId, imageFile, speakerId }
    );

    res.json({
      message: pictogram.originalId
        ? "Se creó una copia personalizada del pictograma base."
        : "Pictograma actualizado correctamente.",
      pictogram,
    });
  } catch (err) {
    console.error("Error en updatePictogramByCaregiver:", err);
    res.status(400).json({ message: err.message });
  }
};

export const updatePictogramBySpeaker = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    if (isNaN(pictogramId)) {
      return res.status(400).json({ message: "ID de pictograma inválido" });
    }

    const { name, posId } = req.body;
    const imageFile = req.file;

    if (!req.user?.userId) {
      return res.status(400).json({ message: "Usuario no válido" });
    }

    const speakerId = req.user.userId;

    const pictogram = await pictogramService.updatePictogramSpeaker(
      speakerId,
      pictogramId,
      {
        name,
        imageFile,
        posId: posId ? parseInt(posId) : undefined,
      }
    );

    res.json({
      message: "Pictograma del usuario actualizado correctamente.",
      pictogram,
    });
  } catch (err) {
    console.error("Error en updatePictogramBySpeaker:", err);
    res.status(400).json({ message: err.message });
  }
};

export const deletePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    await pictogramService.softDeletePictogram(req.user, pictogramId);
    res.json({ message: "Pictograma eliminado correctamente." });
  } catch (err) {
    console.error("Error en deletePictogram:", err);
    res.status(400).json({ message: err.message });
  }
};

export const restorePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const restored = await pictogramService.restorePictogram(
      req.user,
      pictogramId
    );
    res.json({
      message: "Pictograma restaurado correctamente.",
      pictogram: restored,
    });
  } catch (err) {
    console.error("Error en restorePictogram:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getAllPictograms = async (req, res) => {
  try {
    const { speakerId } = req.query;

    const pictograms = await pictogramService.getAllPictograms(
      req.user,
      speakerId ? parseInt(speakerId) : null
    );

    res.status(200).json(pictograms);
  } catch (error) {
    console.error("Error en getAllPictograms:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getArchivedPictograms = async (req, res) => {
  try {
    const targetUserId = req.query.targetUserId
      ? parseInt(req.query.targetUserId)
      : null;

    const pictograms = await pictogramService.getArchivedPictograms(
      req.user,
      targetUserId
    );
    res.json(pictograms);
  } catch (err) {
    console.error("Error en getArchivedPictograms:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getPictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const pictogram = await pictogramService.getPictogramById(
      req.user,
      pictogramId
    );
    res.json(pictogram);
  } catch (err) {
    console.error("Error en getPictogram:", err);
    res.status(404).json({ message: err.message });
  }
};

export const getAllPos = async (req, res) => {
  try {
    const posList = await posService.getAllPos();
    res.json(posList);
  } catch (err) {
    console.error("Error en getAllPos:", err);
    res.status(400).json({ message: err.message });
  }
};
