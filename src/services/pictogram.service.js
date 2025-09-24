import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { ImageRepository } from "../repositories/image.repository.js";
import prisma from "../lib/prisma.js";

const pictogramRepo = new PictogramRepository();
const imageRepo = new ImageRepository();

export class PictogramService {
  // Crear pictograma
  async createPictogram(user, { name, imageFile, posId }) {
    if (!name) throw new Error("El nombre del pictograma es requerido");
    if (!posId) throw new Error("Debe asignarse un Part of Speech (POS)");

    let imageId = null;

    // Crear la imagen si se envió
    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: user.userId,
      });
      imageId = image.id;
    }

    const isAdmin = user.role === "admin";

    // Crear el pictograma con el imageId
    const pictogram = await pictogramRepo.createPictogram({
      name,
      imageId,
      userId: isAdmin ? null : user.userId,
      createdBy: user.userId,
      isActive: true,
    });

    // Crear relación con POS
    await prisma.pictogramPos.create({
      data: {
        pictogramId: pictogram.id,
        posId,
        isPrimary: true,
        confidence: 1,
      },
    });

    return pictogramRepo.findById(pictogram.id);
  }

  // Editar pictograma
  async updatePictogram(user, pictogramId, { name, imageFile, posId }) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive) {
      throw new Error("Pictograma no encontrado");
    }

    // Regla: caregiver no puede editar pictogramas globales
    if (
      user.role === "caregiver" &&
      (!pictogram.userId || pictogram.userId !== user.userId)
    ) {
      throw new Error("No autorizado para editar este pictograma");
    }

    let newImageId = pictogram.imageId;

    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: user.userId,
      });
      newImageId = image.id;
    }

    const updatedPictogram = await pictogramRepo.updatePictogram(pictogramId, {
      name: name || pictogram.name,
      imageId: newImageId,
      updatedAt: new Date(),
    });

    // Actualizar POS si se envió
    if (posId) {
      // Verificar si ya existe relación
      const existingPOS = await prisma.pictogramPos.findFirst({
        where: { pictogramId },
      });

      if (existingPOS) {
        await prisma.pictogramPos.update({
          where: { id: existingPOS.id },
          data: { posId, isPrimary: true, confidence: 1 },
        });
      } else {
        await prisma.pictogramPos.create({
          data: { pictogramId, posId, isPrimary: true, confidence: 1 },
        });
      }
    }

    return pictogramRepo.findById(pictogramId);
  }

  // Eliminación lógica
  async softDeletePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive) {
      throw new Error("Pictograma no encontrado");
    }

    // Regla: caregiver no puede eliminar pictogramas globales
    if (
      user.role === "caregiver" &&
      (!pictogram.userId || pictogram.userId !== user.userId)
    ) {
      throw new Error("No autorizado para eliminar este pictograma");
    }

    return pictogramRepo.updatePictogram(pictogramId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  // Obtener pictograma por ID
  async getPictogramById(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive) {
      throw new Error("Pictograma no encontrado");
    }

    // Caregiver solo puede ver pictogramas propios
    if (
      user.role === "caregiver" &&
      (!pictogram.userId || pictogram.userId !== user.userId)
    ) {
      throw new Error("No autorizado para ver este pictograma");
    }

    return pictogram;
  }

  // Obtener todos los pictogramas
  async getAllPictograms(user) {
    if (user.role === "admin") {
      return pictogramRepo.getAllPictograms();
    }
    // Caregiver: solo los suyos
    return prisma.pictogram.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        userId: user.userId,
      },
      include: { pictogramPos: { include: { pos: true } }, image: true },
    });
  }

  // Asignar pictograma a grids
  async assignPictogramToGrids(user, pictogramId, gridIds) {
    if (!Array.isArray(gridIds)) gridIds = [gridIds];

    const pictogram = await prisma.pictogram.findUnique({
      where: { id: pictogramId },
    });

    if (!pictogram || !pictogram.isActive) {
      throw new Error("Pictograma no encontrado");
    }

    // Solo admin puede usar globales, caregiver solo los suyos
    if (
      user.role === "caregiver" &&
      (!pictogram.userId || pictogram.userId !== user.userId)
    ) {
      throw new Error("No autorizado para asignar este pictograma");
    }

    const results = [];

    for (const gridId of gridIds) {
      const grid = await prisma.grid.findUnique({ where: { id: gridId } });
      if (!grid || !grid.isActive) {
        throw new Error(`Grid ${gridId} no válido`);
      }

      // Validación: caregiver solo en sus grids
      if (user.role === "caregiver" && grid.userId !== user.userId) {
        throw new Error(
          `No autorizado: el grid ${gridId} no pertenece a este caregiver`
        );
      }

      const exists = await prisma.gridPictogram.findUnique({
        where: { gridId_pictogramId: { gridId, pictogramId } },
      });

      if (!exists) {
        const gp = await prisma.gridPictogram.create({
          data: {
            gridId,
            pictogramId,
            position: 0,
          },
        });
        results.push(gp);
      }
    }

    return results;
  }
}
