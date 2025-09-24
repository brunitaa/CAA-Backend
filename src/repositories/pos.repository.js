import prisma from "../lib/prisma.js";

export class PosRepository {
  async findById(id) {
    return prisma.partOfSpeech.findUnique({ where: { id } });
  }

  async getAllPos() {
    return prisma.partOfSpeech.findMany();
  }

  async updatePos(id, data) {
    return prisma.partOfSpeech.update({
      where: { id },
      data,
    });
  }
}
