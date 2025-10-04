import prisma from "../lib/prisma.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { ImageRepository } from "../repositories/image.repository.js";

const pictogramRepo = new PictogramRepository();
const imageRepo = new ImageRepository();

export class PictogramService {
  async createPictogram(user, { name, imageFile, posId, semanticIds = [] }) {
    if (!name) throw new Error("El nombre del pictograma es requerido");
    if (!posId) throw new Error("Debe asignarse un Part of Speech (POS)");

    // Verificar POS
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

    const isAdmin = user.role === "admin";

    // Crear pictograma con POS anidado
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
        semantic: semanticIds.length
          ? {
              createMany: {
                data: semanticIds.map((categoryId) => ({ categoryId })),
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

    // Actualizar POS si se envió
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

    // Actualizar semántica si se envió
    if (Array.isArray(semanticIds)) {
      await prisma.pictogramSemantic.deleteMany({ where: { pictogramId } });

      if (semanticIds.length > 0) {
        await prisma.pictogramSemantic.createMany({
          data: semanticIds.map((categoryId) => ({
            pictogramId,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return pictogramRepo.updatePictogram(pictogramId, updatedData);
  }

  async softDeletePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para eliminar este pictograma");

    return pictogramRepo.softDeletePictogram(pictogramId);
  }

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

  async getPictogramById(user, pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.userId !== user.userId)
      throw new Error("No autorizado para ver este pictograma");

    return pictogram;
  }

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
