// repositories/grid.repository.js
import prisma from "../lib/prisma.js";

export class GridRepository {
  async createGrid(data) {
    return prisma.grid.create({ data });
  }

  async findById(id) {
    return prisma.grid.findUnique({ where: { id } });
  }

  async addPictogram(gridId, pictogramId) {
    return prisma.gridPictogram.create({
      data: { gridId, pictogramId, position: 0 }, // posición inicial, se puede mejorar
    });
  }

  async getAllGrids() {
    return prisma.grid.findMany({
      where: { isActive: true },
    });
  }

  async getGridsByUserIds(userIds) {
    return prisma.grid.findMany({
      where: {
        isActive: true,
        userId: { in: userIds },
      },
    });
  }

  async updateGrid(id, data) {
    return prisma.grid.update({
      where: { id },
      data,
    });
  }

  async softDeleteGrid(id) {
    // Aquí hacemos el soft delete correctamente
    return prisma.grid.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
