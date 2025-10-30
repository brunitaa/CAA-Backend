import prisma from "../lib/prisma.js";
import { PictogramRepository } from "../repositories/pictogram.repository.js";
import { ImageRepository } from "../repositories/image.repository.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";
const pictogramRepo = new PictogramRepository();
const imageRepo = new ImageRepository();
import { exec } from "child_process";
export class PictogramService {
  constructor() {
    this.prisma = prisma;
  }

  async createPictogram(user, targetUserId, { name, imageFile, posId }) {
    if (!name) throw new Error("El nombre del pictograma es requerido");
    if (!posId) throw new Error("Debe asignarse un Part of Speech (POS)");

    const pos = await prisma.partOfSpeech.findUnique({ where: { id: posId } });
    if (!pos) throw new Error("POS no encontrado");

    let imageId = null;
    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: user.userId,
      });
      imageId = image.id;
    }

    const isAdmin = user.role === "admin";

    const pictogram = await prisma.pictogram.create({
      data: {
        name,
        imageId,
        userId: isAdmin ? null : targetUserId,
        createdBy: user.userId,
        isActive: true,
        pictogramPos: {
          create: {
            posId,
            isPrimary: true,
            confidence: 1,
          },
        },
      },
      include: {
        image: true,
        pictogramPos: { include: { pos: true } },
      },
    });

    return pictogram;
  }

  async updatePictogramAdmin(user, pictogramId, { name, posId, imageFile }) {
    console.log("=== updatePictogramAdmin ===");
    console.log("Usuario:", user);
    console.log("pictogramId:", pictogramId);
    console.log("Datos recibidos:", { name, posId, imageFile });
    console.log("=============================");

    if (user.role !== "admin" && !user.isAdmin) {
      throw new Error("No autorizado para actualizar pictogramas globales");
    }

    const pictogram = await this.prisma.pictogram.findUnique({
      where: { id: pictogramId },
      include: { pictogramPos: true, image: true },
    });

    if (!pictogram) throw new Error("Pictograma no encontrado");

    const updatedData = {};
    if (name !== undefined) updatedData.name = name;

    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: user.id,
      });
      updatedData.imageId = image.id;
    }

    console.log("Datos que se enviarán a Prisma:", updatedData);

    await this.prisma.pictogram.update({
      where: { id: pictogramId },
      data: updatedData,
    });

    if (posId !== undefined) {
      if (pictogram.pictogramPos.length > 0) {
        await this.prisma.pictogramPos.update({
          where: { id: pictogram.pictogramPos[0].id },
          data: { posId },
        });
      } else {
        await this.prisma.pictogramPos.create({
          data: {
            pictogramId: pictogram.id,
            posId,
            isPrimary: true,
            confidence: 1,
          },
        });
      }
    }

    const finalPictogram = await this.prisma.pictogram.findUnique({
      where: { id: pictogramId },
      include: { pictogramPos: { include: { pos: true } }, image: true },
    });

    console.log("Pictograma final actualizado:", finalPictogram);

    return finalPictogram;
  }

  async updatePictogramCaregiver(
    caregiver,
    pictogramId,
    { name, posId, imageFile, speakerId } = {}
  ) {
    console.log("=== updatePictogramCaregiver ===");
    console.log(
      "caregiverId:",
      caregiver.userId,
      "pictogramId:",
      pictogramId,
      "speakerId:",
      speakerId
    );
    console.log("Datos recibidos:", { name, posId, imageFile });
    console.log("===============================");

    if (!caregiver?.userId) throw new Error("ID de cuidador inválido");
    if (!speakerId) throw new Error("Debes indicar el ID del speaker");
    if (!pictogramId || typeof pictogramId !== "number")
      throw new Error("ID de pictograma inválido");

    const speakerIdNumber = Number(speakerId);
    if (isNaN(speakerIdNumber))
      throw new Error("ID de speaker inválido (no es un número)");

    const original = await prisma.pictogram.findUnique({
      where: { id: pictogramId },
      include: { pictogramPos: true, image: true },
    });

    if (!original) throw new Error("Pictograma no encontrado");

    const isGlobal = !original.creatorId && !original.userId;

    if (isGlobal) {
      const updatedData = {
        name: name || original.name,
        creator: { connect: { id: caregiver.userId } },
        user: { connect: { id: speakerIdNumber } },
        original: { connect: { id: pictogramId } },
      };

      if (imageFile) {
        const image = await imageRepo.createImage({
          url: `/uploads/images/${imageFile.filename}`,
          filesize: imageFile.size,
          mimeType: imageFile.mimetype,
          userId: caregiver.userId,
        });
        updatedData.image = { connect: { id: image.id } };
      } else if (original.image) {
        updatedData.image = { connect: { id: original.image.id } };
      }

      const copy = await prisma.pictogram.create({ data: updatedData });

      if (posId !== undefined) {
        const posIdNumber = Number(posId);
        if (isNaN(posIdNumber)) throw new Error("posId inválido");

        // desmarcar primarias previas
        await prisma.pictogramPos.updateMany({
          where: { pictogramId: copy.id, isPrimary: true },
          data: { isPrimary: false },
        });

        // si ya existe la relación (copy.id, posIdNumber) -> actualizar, si no -> crear
        const existingPos = await prisma.pictogramPos.findFirst({
          where: { pictogramId: copy.id, posId: posIdNumber },
        });

        if (existingPos) {
          await prisma.pictogramPos.update({
            where: { id: existingPos.id },
            data: { isPrimary: true, confidence: 1 },
          });
        } else {
          await prisma.pictogramPos.create({
            data: {
              pictogramId: copy.id,
              posId: posIdNumber,
              isPrimary: true,
              confidence: 1,
            },
          });
        }
      } else if (original.pictogramPos?.length) {
        for (const pos of original.pictogramPos) {
          await prisma.pictogramPos.create({
            data: {
              pictogramId: copy.id,
              posId: pos.posId,
              isPrimary: pos.isPrimary,
              confidence: pos.confidence,
            },
          });
        }
      }

      const finalPictogram = await prisma.pictogram.findUnique({
        where: { id: copy.id },
        include: { pictogramPos: true, image: true },
      });

      console.log(
        "✅ Pictograma final Caregiver (copia creada):",
        finalPictogram
      );
      return finalPictogram;
    }

    const updatedData = {
      name: name || original.name,
    };

    if (imageFile) {
      const image = await imageRepo.createImage({
        url: `/uploads/images/${imageFile.filename}`,
        filesize: imageFile.size,
        mimeType: imageFile.mimetype,
        userId: caregiver.userId,
      });
      updatedData.image = { connect: { id: image.id } };
    }

    const updated = await prisma.pictogram.update({
      where: { id: pictogramId },
      data: updatedData,
    });

    if (posId !== undefined) {
      const posIdNumber = Number(posId);
      if (isNaN(posIdNumber)) throw new Error("posId inválido");

      await prisma.pictogramPos.updateMany({
        where: { pictogramId, isPrimary: true },
        data: { isPrimary: false },
      });

      const existingPos = await prisma.pictogramPos.findFirst({
        where: { pictogramId, posId: posIdNumber },
      });

      if (existingPos) {
        await prisma.pictogramPos.update({
          where: { id: existingPos.id },
          data: { isPrimary: true, confidence: 1 },
        });
      } else {
        await prisma.pictogramPos.create({
          data: {
            pictogramId,
            posId: posIdNumber,
            isPrimary: true,
            confidence: 1,
          },
        });
      }
    }

    const finalPictogram = await prisma.pictogram.findUnique({
      where: { id: pictogramId },
      include: { pictogramPos: true, image: true },
    });

    console.log("✅ Pictograma final Caregiver (editado):", finalPictogram);
    return finalPictogram;
  }

  async updatePictogramSpeaker(
    speakerId,
    pictogramId,
    { name, posId, imageFile } = {}
  ) {
    console.log("=== updatePictogramSpeaker ===");
    console.log("speakerId:", speakerId, "pictogramId:", pictogramId);
    console.log("Datos recibidos:", { name, posId, imageFile });
    console.log("===============================");

    if (!speakerId) throw new Error("ID de speaker inválido");
    if (!pictogramId || typeof pictogramId !== "number")
      throw new Error("ID de pictograma inválido");

    // Buscar pictograma original
    const original = await prisma.pictogram.findUnique({
      where: { id: pictogramId },
      include: { pictogramPos: true, image: true },
    });
    if (!original) throw new Error("Pictograma no encontrado");

    const isGlobal = !original.userId; // Si no tiene userId, es global y se puede editar

    if (isGlobal) {
      // ✅ Editar directamente el pictograma original
      const updatedData = {
        name: name || original.name,
      };

      // Imagen
      if (imageFile) {
        const image = await imageRepo.createImage({
          url: `/uploads/images/${imageFile.filename}`,
          filesize: imageFile.size,
          mimeType: imageFile.mimetype,
          userId: speakerId,
        });
        updatedData.image = { connect: { id: image.id } };
      }

      // Actualizar pictograma
      const updated = await prisma.pictogram.update({
        where: { id: pictogramId },
        data: updatedData,
      });

      // POS
      if (posId !== undefined) {
        // Desmarcar primarias actuales
        await prisma.pictogramPos.updateMany({
          where: { pictogramId, isPrimary: true },
          data: { isPrimary: false },
        });

        // Crear nueva POS primaria
        await prisma.pictogramPos.create({
          data: {
            pictogramId,
            posId,
            isPrimary: true,
            confidence: 1,
          },
        });
      }

      const finalPictogram = await prisma.pictogram.findUnique({
        where: { id: pictogramId },
        include: { pictogramPos: true, image: true },
      });

      console.log("Pictograma final Speaker (editado):", finalPictogram);
      return finalPictogram;
    } else {
      // ✅ Crear copia si el pictograma ya pertenece a otro speaker
      const updatedData = {
        name: name || original.name,
        originalId: pictogramId,
        createdBy: speakerId,
        creator: { connect: { id: speakerId } },
        userId: speakerId,
        user: { connect: { id: speakerId } },
      };

      if (imageFile) {
        const image = await imageRepo.createImage({
          url: `/uploads/images/${imageFile.filename}`,
          filesize: imageFile.size,
          mimeType: imageFile.mimetype,
          userId: speakerId,
        });
        updatedData.image = { connect: { id: image.id } };
      } else if (original.image) {
        updatedData.image = { connect: { id: original.image.id } };
      }

      // Crear la copia
      const copy = await prisma.pictogram.create({ data: updatedData });

      // POS
      if (posId !== undefined) {
        await prisma.pictogramPos.create({
          data: {
            pictogramId: copy.id,
            posId,
            isPrimary: true,
            confidence: 1,
          },
        });
      } else if (original.pictogramPos?.length) {
        for (const pos of original.pictogramPos) {
          await prisma.pictogramPos.create({
            data: {
              pictogramId: copy.id,
              posId: pos.posId,
              isPrimary: pos.isPrimary,
              confidence: pos.confidence,
            },
          });
        }
      }

      const finalPictogram = await prisma.pictogram.findUnique({
        where: { id: copy.id },
        include: { pictogramPos: true, image: true },
      });

      console.log("Pictograma final Speaker (copia):", finalPictogram);
      return finalPictogram;
    }
  }

  async softDeletePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.createdBy !== user.userId)
      throw new Error("No autorizado para eliminar este pictograma");

    return pictogramRepo.softDeletePictogram(pictogramId);
  }

  async restorePictogram(user, pictogramId) {
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);
    if (!pictogram) throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.createdBy !== user.userId)
      throw new Error("No autorizado para restaurar este pictograma");

    return pictogramRepo.updatePictogram(pictogramId, {
      isActive: true,
      deletedAt: null,
      updatedAt: new Date(),
    });
  }

  async getAllPictograms(user, speakerId) {
    try {
      if (user.role === "admin") return pictogramRepo.getAllPictograms();

      const pictograms = await prisma.pictogram.findMany({
        where: {
          isActive: true,
          OR: speakerId
            ? [{ userId: speakerId }, { userId: null }]
            : [{ userId: null }],
        },
        include: {
          pictogramPos: { include: { pos: true } },
          image: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return pictograms;
    } catch (error) {
      console.error("Error en getAllPictograms:", error);
      throw error;
    }
  }
  async getAllPictogramsForModel(speakerId) {
    // Solo globales + personales del speaker
    const pictos = await pictogramRepo.getGlobalOrSpeaker(speakerId);
    return pictos.map((p) => p.id.toString());
  }

  async getPictogramById(user, pictogramId) {
    const pictogram = await pictogramRepo.findPictogramById(pictogramId);
    if (!pictogram || !pictogram.isActive)
      throw new Error("Pictograma no encontrado");

    if (user.role === "caregiver" && pictogram.createdBy !== user.userId)
      throw new Error("No autorizado para ver este pictograma");

    return pictogram;
  }
  async getArchivedPictograms(user, speakerId) {
    try {
      if (user.role === "admin") {
        return pictogramRepo.getArchivedPictograms();
      }

      const pictograms = await prisma.pictogram.findMany({
        where: {
          isActive: false,
          OR: speakerId
            ? [{ userId: speakerId }, { userId: null }]
            : [{ userId: null }],
        },
        include: {
          pictogramPos: { include: { pos: true } },
          image: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return pictograms;
    } catch (error) {
      console.error("Error en getArchivedPictograms:", error);
      throw error;
    }
  }
}
