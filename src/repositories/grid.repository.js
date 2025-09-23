// repositories/grid.repository.js
import prisma from "../lib/prisma.js";

export class GridRepository {
  async createGrid(data) {
    return prisma.grid.create({ data });
  }

  async findGridById(id) {
    return prisma.grid.findUnique({
      where: { id },
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
