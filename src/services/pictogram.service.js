import prisma from "../lib/prisma.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { ImageRepository } from "../repositories/image.repository.js";

const pictogramRepo = new PictogramRepository();
const imageRepo = new ImageRepository();

export class PictogramService {
  //  Crear pictograma
  async createPictogram(user, { name, imageFile, posId, semanticIds }) {
    if (!name) throw new Error("El nombre del pictograma es requerido");
    if (!posId) throw new Error("Debe asignarse un Part of Speech (POS)");

    const pos = await prisma.partOfSpeech.findUnique({ where: { id: posId } });
    if (!pos) throw new Error("POS no encontrado");

    // Crear imagen si se envió
    let imageId = null;
    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: user.userId,
      });
      imageId = image.id;
    }

    // Normalizar semanticIds siempre a array de enteros
    const semanticArray = semanticIds
      ? Array.isArray(semanticIds)
        ? semanticIds.map((id) => parseInt(id))
        : [parseInt(semanticIds)]
      : [];

    const isAdmin = user.role === "admin";

    const pictogram = await prisma.pictogram.create({
      data: {
        name,
        imageId,
        userId: isAdmin ? null : user.userId,
        createdBy: user.userId,
        isActive: true,
        pictogramPos: {
          create: {
            posId,
            isPrimary: true,
            confidence: 1,
          },
        },
        semantic: semanticArray.length
          ? {
              createMany: {
                data: semanticArray.map((categoryId) => ({ categoryId })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
      },
    });

    return pictogram;
  }

  //  Actualizar pictograma
  async updatePictogram(
    user,
    pictogramId,
    { name, imageFile, posId, semanticIds }
  ) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para editar este pictograma");

    // Crear nueva imagen si se envió
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

    const updatedData = {
      name: name || pictogram.name,
      imageId: newImageId,
      updatedAt: new Date(),
    };

    // Actualizar POS
    if (posId) {
      const pos = await prisma.partOfSpeech.findUnique({
        where: { id: posId },
      });
      if (!pos) throw new Error("POS no encontrado");

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

    // Actualizar categorías semánticas
    if (semanticIds !== undefined) {
      // Normalizar a array
      const semanticArray = Array.isArray(semanticIds)
        ? semanticIds.map((id) => parseInt(id))
        : [parseInt(semanticIds)];

      // Eliminar existentes
      await prisma.pictogramSemantic.deleteMany({ where: { pictogramId } });

      // Crear nuevas si hay
      if (semanticArray.length > 0) {
        await prisma.pictogramSemantic.createMany({
          data: semanticArray.map((categoryId) => ({
            pictogramId,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Actualizar datos principales
    return pictogramRepo.updatePictogram(pictogramId, updatedData);
  }

  //  Soft delete
  async softDeletePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para eliminar este pictograma");

    return pictogramRepo.softDeletePictogram(pictogramId);
  }

  //  Restaurar pictograma
  async restorePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram) throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para restaurar este pictograma");

    return pictogramRepo.updatePictogram(pictogramId, {
      isActive: true,
      deletedAt: null,
      updatedAt: new Date(),
    });
  }

  //  Obtener todos los pictogramas activos
  async getAllPictograms(user) {
    if (user.role === "admin") return pictogramRepo.getAllPictograms();

    return prisma.pictogram.findMany({
      where: { isActive: true, userId: user.userId },
      include: {
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        image: true,
      },
    });
  }

  //  Obtener por ID
  async getPictogramById(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para ver este pictograma");

    return pictogram;
  }

  //  Obtener pictogramas archivados
  async getArchivedPictograms(user) {
    if (user.role === "admin") return pictogramRepo.getArchivedPictograms();

    return prisma.pictogram.findMany({
      where: { isActive: false, userId: user.userId },
      include: {
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        image: true,
      },
    });
  }
}
