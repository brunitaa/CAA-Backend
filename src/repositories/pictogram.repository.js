import prisma from "../lib/prisma.js";

export class PictogramRepository {
  async createPictogram(data) {
    return prisma.pictogram.create({ data });
  }

  async findById(id) {
    return prisma.pictogram.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  async getAllPictograms() {
    return prisma.pictogram.findMany({
      where: { isActive: true },
      include: { image: true },
    });
  }

  async updatePictogram(id, data) {
    return prisma.pictogram.update({
      where: { id },
      data,
    });
  }

  async softDeletePictogram(id) {
    return prisma.pictogram.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }
}
