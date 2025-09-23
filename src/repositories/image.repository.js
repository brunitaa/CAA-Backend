import prisma from "../lib/prisma.js";

export class ImageRepository {
  async createImage({ url, userId, filesize, height, width, mimeType }) {
    return prisma.image.create({
      data: { url, userId, filesize, height, width, mimeType },
    });
  }

  async findById(id) {
    return prisma.image.findUnique({ where: { id } });
  }
}
