import prisma from "../lib/prisma.js";

export class GridPictogramRepository {
  // Verifica si un pictograma ya está asignado a un grid
  async exists(gridId, pictogramId) {
    const record = await prisma.gridPictogram.findUnique({
      where: { gridId_pictogramId: { gridId, pictogramId } },
    });
    return !!record; // true si existe, false si no
  }

  // Obtiene la siguiente posición disponible en un grid
  async getNextPosition(gridId) {
    const last = await prisma.gridPictogram.findFirst({
      where: { gridId },
      orderBy: { position: "desc" },
    });
    return last ? last.position + 1 : 0;
  }

  // Crear un pictograma en un grid
  async addPictogram(gridId, pictogramId, position) {
    return prisma.gridPictogram.create({
      data: { gridId, pictogramId, position },
    });
  }

  // Eliminar un pictograma de un grid
  async removePictogramFromGrid(gridId, pictogramId) {
    return prisma.gridPictogram.delete({
      where: { gridId_pictogramId: { gridId, pictogramId } },
    });
  }

  // Obtener pictogramas de un grid
  async getPictogramsByGrid(gridId) {
    return prisma.gridPictogram.findMany({
      where: { gridId },
      include: { pictogram: { include: { image: true } } },
      orderBy: { position: "asc" },
    });
  }
}
