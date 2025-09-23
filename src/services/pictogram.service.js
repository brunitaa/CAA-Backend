import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { ImageRepository } from "../repositories/image.repository.js";
import prisma from "../lib/prisma.js";

const pictogramRepo = new PictogramRepository();
const imageRepo = new ImageRepository();

export class PictogramService {
  async createPictogram(user, { name, imageFile }) {
    if (!name || !imageFile) throw new Error("Nombre y archivo son requeridos");

    // Guardar imagen
    const image = await imageRepo.createImage({
      url: `/uploads/images/${imageFile.filename}`,
      userId: user.userId,
      filesize: imageFile.size,
      mimeType: imageFile.mimetype,
    });

    return pictogramRepo.createPictogram({
      name,
      imageId: image.id,
      createdBy: user.userId,
    });
  }

  async updatePictogram(user, pictogramId, { name, imageFile }) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    let newImageId = pictogram.imageId;
    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        userId: user.userId,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
      });
      newImageId = image.id;
    }

    return prisma.pictogram.update({
      where: { id: pictogramId },
      data: {
        name: name || pictogram.name,
        imageId: newImageId,
        updatedAt: new Date(),
      },
    });
  }

  // Soft delete
  async softDeletePictogram(pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    return pictogramRepo.updatePictogram(pictogramId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  async getPictogram(pictogramId) {
    const pictogram = await pictogramRepo.findById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");
    return pictogram;
  }

  async getAllPictograms() {
    return pictogramRepo.getAllPictograms();
  }
}
