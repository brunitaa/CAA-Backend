import { PictogramService } from "../services/pictogram.service.js";
import { PosService } from "../services/pos.service.js";

const pictogramService = new PictogramService();

// Función auxiliar para normalizar semanticIds
const normalizeSemanticIds = (semanticIds) => {
  if (!semanticIds) return [];
  return Array.isArray(semanticIds)
    ? semanticIds.map((id) => parseInt(id))
    : [parseInt(semanticIds)];
};

// Crear pictograma
export const createPictogram = async (req, res) => {
  try {
    const { name, posId, semanticIds } = req.body;
    const imageFile = req.file; // multer

    const pictogram = await pictogramService.createPictogram(req.user, {
      name,
      imageFile,
      posId: parseInt(posId),
      semanticIds: normalizeSemanticIds(semanticIds),
    });

    res.status(201).json(pictogram);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Editar pictograma
export const updatePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const { name, posId, semanticIds } = req.body;
    const imageFile = req.file;

    const pictogram = await pictogramService.updatePictogram(
      req.user,
      pictogramId,
      {
        name,
        imageFile,
        posId: posId ? parseInt(posId) : undefined,
        semanticIds:
          semanticIds !== undefined
            ? normalizeSemanticIds(semanticIds)
            : undefined,
      }
    );

    res.json(pictogram);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Soft delete
export const deletePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    await pictogramService.softDeletePictogram(req.user, pictogramId);
    res.json({ message: "Pictograma eliminado" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Restaurar pictograma
export const restorePictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const restored = await pictogramService.restorePictogram(
      req.user,
      pictogramId
    );
    res.json(restored);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener todos los pictogramas
export const getAllPictograms = async (req, res) => {
  try {
    const pictograms = await pictogramService.getAllPictograms(req.user);
    res.json(pictograms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener pictogramas archivados
export const getArchivedPictograms = async (req, res) => {
  try {
    const pictograms = await pictogramService.getArchivedPictograms(req.user);
    res.json(pictograms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener por ID
export const getPictogram = async (req, res) => {
  try {
    const pictogramId = parseInt(req.params.id);
    const pictogram = await pictogramService.getPictogramById(
      req.user,
      pictogramId
    );
    res.json(pictogram);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Obtener todos los POS
export const getAllPos = async (req, res) => {
  try {
    const posList = await posService.getAllPos();
    res.json(posList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener todas las categorías semánticas
export const getAllSemanticCategories = async (req, res) => {
  try {
    const categories = await prisma.semanticCategory.findMany();
    res.json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
