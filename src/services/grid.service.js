import { GridRepository } from "../repositories/grid.repository.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";
import prisma from "../lib/prisma.js";

const gridRepo = new GridRepository();
const caregiverSpeakerRepo = new CaregiverSpeakerRepository();

export class GridService {
  async createGrid(user, targetUserId, { name, description }) {
    if (!name) throw new Error("El nombre del grid es requerido");

    // Admin: crea grid global
    if (user.role === "admin") {
      return gridRepo.createGrid({
        name,
        description,
        isGlobal: true,
        userId: null, // grid global
        createdBy: user.userId, // admin que lo creó
      });
    }

    // Caregiver: crea grid para un speaker
    if (user.role === "caregiver") {
      if (!targetUserId) throw new Error("Se requiere seleccionar un speaker");

      // Verificar relación caregiver <-> speaker
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        targetUserId
      );
      if (!relation)
        throw new Error("No puedes crear un grid para este speaker");

      return gridRepo.createGrid({
        name,
        description,
        isGlobal: false, // grid no global
        userId: targetUserId, // pertenece al speaker
        createdBy: user.userId, // caregiver que lo creó
      });
    }

    // Speaker: crea su propio grid
    if (user.role === "speaker") {
      return gridRepo.createGrid({
        name,
        description,
        isGlobal: false, // grid no global
        userId: user.userId, // pertenece al speaker
        createdBy: user.userId, // speaker que lo creó
      });
    }

    throw new Error("Rol no autorizado para crear grids");
  }

  async getAllGrids(user, speakerId) {
    try {
      if (user.role === "admin") {
        return prisma.grid.findMany({
          include: {
            gridPictograms: { include: { pictogram: true } },
            user: true,
            createdByUser: true,
          },
          orderBy: { createdAt: "desc" },
        });
      }

      if (user.role === "caregiver") {
        if (!speakerId) throw new Error("Se requiere seleccionar un speaker");
        const relation = await caregiverSpeakerRepo.findRelation(
          user.userId,
          speakerId
        );
        if (!relation) throw new Error("No tienes permiso sobre este speaker");

        return prisma.grid.findMany({
          where: {
            isActive: true,
            OR: [
              { userId: null }, // grids globales
              { userId: speakerId, createdBy: user.userId }, // grids personales creados por este caregiver para este speaker
            ],
          },
          include: { gridPictograms: { include: { pictogram: true } } },
          orderBy: { createdAt: "desc" },
        });
      }

      if (user.role === "speaker") {
        return prisma.grid.findMany({
          where: {
            isActive: true,
            OR: [
              { userId: null }, // grids globales
              { userId: user.userId }, // grids propios
            ],
          },
          include: { gridPictograms: { include: { pictogram: true } } },
          orderBy: { createdAt: "desc" },
        });
      }

      throw new Error("No autorizado para ver grids");
    } catch (error) {
      console.error("Error en getAllGrids:", error);
      throw error;
    }
  }

  async getGridById(user, gridId) {
    if (!gridId) throw new Error("ID del grid requerido");
    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "caregiver") {
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        grid.userId
      );
      if (!relation && grid.userId)
        throw new Error("No tienes permiso para ver este grid");
    }

    if (user.role === "speaker" && grid.userId && grid.userId !== user.userId) {
      throw new Error("No tienes permiso para ver este grid");
    }

    return grid;
  }

  // Actualizar grid
  async updateGrid(user, gridId, { name, description }) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid || !grid.isActive) throw new Error("Grid no encontrado");

    if (user.role === "admin") {
      if (!grid.isGlobal)
        throw new Error("No puedes actualizar grids personales");
      return gridRepo.updateGrid(gridId, { name, description });
    }

    if (user.role === "caregiver") {
      if (grid.createdBy !== user.userId)
        throw new Error("No puedes actualizar este grid");
      return gridRepo.updateGrid(gridId, { name, description });
    }

    throw new Error("Rol no autorizado para actualizar grids");
  }

  async deleteGrid(user, gridId) {
    console.log(" deleteGrid() llamada con:");
    console.log("  user:", user);
    console.log("  gridId:", gridId);

    const grid = await gridRepo.findGridById(gridId);
    console.log(" Grid encontrado:", grid);

    if (!grid) {
      console.error(" Error: Grid no encontrado");
      throw new Error("Grid no encontrado");
    }

    if (user.role === "admin") {
      console.log(" Rol: admin");
      if (!grid.isGlobal) {
        console.warn(" Admin intenta eliminar un grid personal:", grid.id);
        throw new Error("No puedes eliminar grids personales");
      }

      console.log(" Eliminando grid global (admin)...");
      const result = await gridRepo.softDeleteGrid(gridId);
      console.log(" Resultado softDeleteGrid:", result);
      return result;
    }

    if (user.role === "caregiver") {
      console.log("Rol: caregiver");
      console.log("  grid.createdBy:", grid.createdBy);
      console.log("  user.userId:", user.userId);

      if (grid.createdBy !== user.userId) {
        console.warn("Cuidador intenta eliminar grid ajeno:", grid.id);
        throw new Error("No puedes eliminar este grid");
      }

      console.log(" Eliminando grid propio (caregiver)...");
      const result = await gridRepo.softDeleteGrid(gridId);
      console.log(" Resultado softDeleteGrid:", result);
      return result;
    }

    console.error(" Rol no autorizado:", user.role);
    throw new Error("Rol no autorizado para eliminar grids");
  }

  // Obtener grids archivados
  async getArchivedGrids(user, speakerId) {
    if (user.role === "admin") return gridRepo.getGridsByActiveStatus(false);

    if (user.role === "caregiver") {
      if (!speakerId) throw new Error("Se requiere seleccionar un speaker");
      const relation = await caregiverSpeakerRepo.findRelation(
        user.userId,
        speakerId
      );
      if (!relation) throw new Error("No tienes permiso sobre este speaker");

      return prisma.grid.findMany({
        where: {
          isActive: false,
          OR: [{ userId: null }, { userId: speakerId, createdBy: user.userId }],
        },
        include: { gridPictograms: { include: { pictogram: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    throw new Error("No autorizado para ver grids archivados");
  }

  // Restaurar grid
  async restoreGrid(user, gridId) {
    const grid = await gridRepo.findGridById(gridId);
    if (!grid) throw new Error("Grid no encontrado");
    if (grid.isActive) return grid;

    if (user.role === "admin") {
      if (!grid.isGlobal)
        throw new Error("No puedes restaurar grids personales");
      return gridRepo.updateGrid(gridId, { isActive: true });
    }

    if (user.role === "caregiver") {
      if (grid.createdBy !== user.userId)
        throw new Error("No puedes restaurar este grid");
      return gridRepo.updateGrid(gridId, { isActive: true });
    }

    throw new Error("Rol no autorizado para restaurar grids");
  }
}
