import prisma from "../lib/prisma.js";

export class PictogramRepository {
  async createPictogram(data) {
    return prisma.pictogram.create({ data });
  }

  async findPictogramById(id) {
    return prisma.pictogram.findUnique({
      where: { id },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        gridPictograms: true,
        creator: true,
        user: true,
      },
    });
  }

  async updatePictogram(id, data) {
    return prisma.pictogram.update({
      where: { id },
      data,
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        gridPictograms: true,
        creator: true,
        user: true,
      },
    });
  }

  async softDeletePictogram(id) {
    return prisma.pictogram.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
      },
    });
  }

  async getAllPictograms() {
    return prisma.pictogram.findMany({
      where: { isActive: true },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        creator: true,
        user: true,
      },
    });
  }

  async getArchivedPictograms() {
    return prisma.pictogram.findMany({
      where: { isActive: false },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        creator: true,
        user: true,
      },
    });
  }

  async findPictogramsByIds(ids) {
    if (!Array.isArray(ids)) throw new Error("IDs deben ser un array");
    return prisma.pictogram.findMany({
      where: { id: { in: ids } },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
      },
    });
  }
}
