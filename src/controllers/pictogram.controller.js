import * as pictogramService from "../services/pictogram.service.js";
import UserError from "../errors/user.error.js";

export const getBasePictograms = async (req, res) => {
  try {
    const pictograms = await pictogramService.getBasePictograms();
    res.json(pictograms);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pictogramas base" });
  }
};

export const createBasePictogram = async (req, res) => {
  try {
    const { name, imageUrl, description } = req.body;
    const pictogram = await pictogramService.createBasePictogram({
      name,
      imageUrl,
      description,
    });
    res.status(201).json(pictogram);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getUserPictograms = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token
    const pictograms = await pictogramService.getUserPictograms(userId);
    res.json(pictograms);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pictogramas" });
  }
};

export const createUserPictogram = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, imageUrl, description } = req.body;
    const pictogram = await pictogramService.createUserPictogram({
      userId,
      name,
      imageUrl,
      description,
    });
    res.status(201).json(pictogram);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updatePictogram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, description } = req.body;

    const pictogram = await pictogramService.getPictogramById(Number(id));
    if (!pictogram) throw new UserError("Pictograma no encontrado", 404);

    // Validación de permisos
    if (pictogram.userId === null) {
      // Es de la librería base → solo admin
      if (req.user.role !== "admin")
        throw new UserError(
          "No tienes permisos para editar pictogramas base",
          403
        );
    } else {
      // Es de un usuario → solo el dueño
      if (pictogram.userId !== req.user.id)
        throw new UserError(
          "No puedes editar pictogramas de otros usuarios",
          403
        );
    }

    const updated = await pictogramService.updatePictogram(Number(id), {
      name,
      imageUrl,
      description,
    });

    res.json(updated);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deletePictogram = async (req, res) => {
  try {
    const { id } = req.params;

    const pictogram = await pictogramService.getPictogramById(Number(id));
    if (!pictogram) throw new UserError("Pictograma no encontrado", 404);

    // Validación de permisos
    if (pictogram.userId === null) {
      if (req.user.role !== "admin")
        throw new UserError(
          "No tienes permisos para borrar pictogramas base",
          403
        );
    } else {
      if (pictogram.userId !== req.user.id)
        throw new UserError(
          "No puedes borrar pictogramas de otros usuarios",
          403
        );
    }

    await pictogramService.deletePictogram(Number(id));
    res.json({ message: "Pictograma eliminado con éxito" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getPictogramById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // puede ser null si no se requiere auth

    const pictogram = await pictogramService.getPictogramById(
      Number(id),
      userId
    );

    res.json(pictogram);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
