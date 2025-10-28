import prisma from "../lib/prisma.js";

export class GridPictogramRepository {
  async exists(gridId, pictogramId) {
    return !!(await prisma.gridPictogram.findUnique({
      where: { gridId_pictogramId: { gridId, pictogramId } },
    }));
  }

  async getNextPosition(gridId) {
    const last = await prisma.gridPictogram.findFirst({
      where: { gridId },
      orderBy: { position: "desc" },
    });
    return last ? last.position + 1 : 1;
  }

  async addPictogram(gridId, pictogramId, position) {
    return prisma.gridPictogram.create({
      data: { gridId, pictogramId, position },
    });
  }

  async removePictogramFromGrid(gridId, pictogramId) {
    return prisma.gridPictogram.deleteMany({
      where: { gridId, pictogramId },
    });
  }

  async getPictogramsByGrid(gridId) {
    return prisma.gridPictogram.findMany({
      where: { gridId },
      orderBy: { position: "asc" },
      include: {
        pictogram: {
          include: {
            image: true,
            pictogramPos: { include: { pos: true } },
            creator: true,
            user: true,
          },
        },
      },
    });
  }

  async findPictogramById(id) {
    if (id == null) return null;
    return prisma.pictogram.findUnique({
      where: { id: Number(id) },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        creator: true,
        user: true,
      },
    });
  }

  async findPictogramsByIds(ids) {
    if (!Array.isArray(ids)) ids = [ids];
    const normalized = ids.map((i) => Number(i));
    return prisma.pictogram.findMany({
      where: { id: { in: normalized } },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
        creator: true,
        user: true,
      },
    });
  }
}
