// repositories/grid.repository.js
import prisma from "../lib/prisma.js";

export class GridRepository {
  async createGrid(data) {
    try {
      return await prisma.grid.create({ data });
    } catch (err) {
      throw new Error("Error en repositorio creando grid: " + err.message);
    }
  }

  async findGridById(id) {
    try {
      return await prisma.grid.findUnique({ where: { id } });
    } catch (err) {
      throw new Error("Error buscando grid: " + err.message);
    }
  }
  async getGridsByActiveStatus(isActive) {
    return prisma.grid.findMany({
      where: { isActive },
      orderBy: { createdAt: "desc" },
    });
  }

  async restoreGrid(id) {
    return prisma.grid.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async addPictogram(gridId, pictogramId) {
    try {
      return await prisma.gridPictogram.create({
        data: { gridId, pictogramId, position: 0 },
      });
    } catch (err) {
      throw new Error("Error asignando pictograma al grid: " + err.message);
    }
  }

  async getAllGrids() {
    try {
      return await prisma.grid.findMany({
        where: { isActive: true },
      });
    } catch (err) {
      throw new Error("Error obteniendo grids: " + err.message);
    }
  }

  async getGridsByUserIds(userIds) {
    try {
      return await prisma.grid.findMany({
        where: {
          isActive: true,
          userId: { in: userIds },
        },
      });
    } catch (err) {
      throw new Error("Error obteniendo grids de usuarios: " + err.message);
    }
  }

  async updateGrid(id, data) {
    try {
      return await prisma.grid.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new Error("Error actualizando grid: " + err.message);
    }
  }

  async softDeleteGrid(id) {
    try {
      return await prisma.grid.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (err) {
      throw new Error("Error eliminando grid: " + err.message);
    }
  }
}
