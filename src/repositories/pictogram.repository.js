import prisma from "../lib/prisma.js";

export class PictogramRepository {
  // Crear pictograma
  async createPictogram(data) {
    return prisma.pictogram.create({ data });
  }

  // Obtener pictograma por ID con relaciones completas
  async findById(id) {
    return prisma.pictogram.findUnique({
      where: { id },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        gridPictograms: true,
        creator: true,
        user: true,
      },
    });
  }

  // Actualizar pictograma
  async updatePictogram(id, data) {
    return prisma.pictogram.update({
      where: { id },
      data,
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        gridPictograms: true,
        creator: true,
        user: true,
      },
    });
  }

  // Soft delete
  async softDeletePictogram(id) {
    return prisma.pictogram.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
      },
    });
  }

  // Obtener todos los pictogramas activos
  async getAllPictograms() {
    return prisma.pictogram.findMany({
      where: { isActive: true },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        creator: true,
        user: true,
      },
    });
  }

  // Obtener todos los pictogramas archivados
  async getArchivedPictograms() {
    return prisma.pictogram.findMany({
      where: { isActive: false },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
        creator: true,
        user: true,
      },
    });
  }

  // Buscar varios pictogramas por IDs
  async findPictogramsByIds(ids) {
    if (!Array.isArray(ids)) throw new Error("IDs deben ser un array");
    return prisma.pictogram.findMany({
      where: { id: { in: ids } },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        semantic: { include: { category: true } },
      },
    });
  }
}
