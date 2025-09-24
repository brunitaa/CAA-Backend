// src/controllers/image.controller.js
import prisma from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = [
  upload.single("image"),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) throw new Error("Archivo no proporcionado");

      const image = await prisma.image.create({
        data: {
          url: `/uploads/${file.filename}`,
          filesize: file.size,
          mimeType: file.mimetype,
          userId: req.user.userId,
        },
      });

      res.json(image);
    } catch (err) {
      next(err);
    }
  },
];

export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });
    if (!image) throw new Error("Imagen no encontrada");

    if (req.user.role !== "admin" && req.user.userId !== image.userId) {
      throw new Error("No autorizado para eliminar esta imagen");
    }

    await prisma.image.delete({ where: { id: image.id } });
    fs.unlinkSync(path.join("uploads", path.basename(image.url)));

    res.json({ message: "Imagen eliminada" });
  } catch (err) {
    next(err);
  }
};
