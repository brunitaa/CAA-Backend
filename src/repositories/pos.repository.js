import prisma from "../lib/prisma.js";

export class PosRepository {
  // -----------------
  // POS
  // -----------------
  async findById(id) {
    return prisma.partOfSpeech.findUnique({
      where: { id },
    });
  }

  async getAllPos() {
    return prisma.partOfSpeech.findMany();
  }

  async createPos(data) {
    return prisma.partOfSpeech.create({ data });
  }

  async updatePos(id, data) {
    return prisma.partOfSpeech.update({
      where: { id },
      data,
    });
  }

  async deletePos(id) {
    return prisma.partOfSpeech.delete({
      where: { id },
    });
  }
}
