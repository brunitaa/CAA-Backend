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

  // -----------------
  // SEMANTIC
  // -----------------
  async getSemanticByPos(posId) {
    return prisma.semanticCategory.findMany({
      where: {
        pictograms: {
          some: { pictogram: { pictogramPos: { some: { posId } } } },
        },
      },
    });
  }

  async createSemantic(data) {
    return prisma.semanticCategory.create({ data });
  }

  async deleteSemantic(id) {
    return prisma.semanticCategory.delete({
      where: { id },
    });
  }

  async findSemanticById(id) {
    return prisma.semanticCategory.findUnique({ where: { id } });
  }
}
