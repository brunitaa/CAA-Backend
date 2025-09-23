import prisma from "../lib/prisma.js";

export class GridPictogramRepository {
  async assignPictogramToGrid(gridId, pictogramId, position) {
    return prisma.gridPictogram.create({
      data: { gridId, pictogramId, position },
    });
  }

  async removePictogramFromGrid(gridId, pictogramId) {
    return prisma.gridPictogram.delete({
      where: { gridId_pictogramId: { gridId, pictogramId } },
    });
  }

  async getPictogramsByGrid(gridId) {
    return prisma.gridPictogram.findMany({
      where: { gridId },
      include: { pictogram: { include: { image: true } } },
      orderBy: { position: "asc" },
    });
  }
}
