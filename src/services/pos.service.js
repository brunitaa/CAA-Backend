import { PosRepository } from "../repositories/pos.repository.js";
import prisma from "../lib/prisma.js";

const posRepo = new PosRepository();

export class PosService {
  async createPos(user, { code, name, description, color }) {
    if (user.role !== "admin") throw new Error("No autorizado");
    if (!code || !name || !color)
      throw new Error("Code, name y color son obligatorios");

    return posRepo.createPos({ code, name, description, color });
  }

  async getAllPos() {
    return posRepo.getAllPos();
  }

  async getPosById(id) {
    const pos = await posRepo.findById(id);
    if (!pos) throw new Error("POS no encontrado");
    return pos;
  }

  async updatePos(user, id, { code, name, description, color }) {
    if (user.role !== "admin") throw new Error("No autorizado");
    const pos = await posRepo.findById(id);
    if (!pos) throw new Error("POS no encontrado");

    return posRepo.updatePos(id, { code, name, description, color });
  }

  async deletePos(user, id) {
    if (user.role !== "admin") throw new Error("No autorizado");
    const pos = await posRepo.findById(id);
    if (!pos) throw new Error("POS no encontrado");

    return posRepo.deletePos(id);
  }

  // Semantic categories relacionadas a un POS
  async getSemanticByPos(posId) {
    const semantics = await prisma.pictogramSemantic.findMany({
      where: { posId },
      include: { pictogram: true },
    });
    return semantics;
  }

  async createSemantic(user, { posId, name, description }) {
    if (user.role !== "admin") throw new Error("No autorizado");
    if (!posId || !name) throw new Error("POS y nombre son obligatorios");

    return prisma.pictogramSemantic.create({
      data: { posId, name, description },
    });
  }

  async deleteSemantic(user, id) {
    if (user.role !== "admin") throw new Error("No autorizado");
    const semantic = await prisma.pictogramSemantic.findUnique({
      where: { id },
    });
    if (!semantic) throw new Error("Semantic no encontrado");

    return prisma.pictogramSemantic.delete({ where: { id } });
  }
}
