import prisma from "../db.js";
import UserError from "../errors/user.error.js";

// Obtener todos los pictogramas de la librería base
export const getBasePictograms = async () => {
  return await prisma.pictogram.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
  });
};

// Crear pictograma en la librería base (solo admin)
export const createBasePictogram = async ({ name, imageUrl, description }) => {
  if (!name || !imageUrl)
    throw new UserError("Nombre e imagen obligatorios", 400);

  return await prisma.pictogram.create({
    data: {
      name,
      imageUrl,
      description: description || null,
      userId: null,
    },
  });
};

// Obtener todos los pictogramas de un usuario
export const getUserPictograms = async (userId) => {
  return await prisma.pictogram.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// Obtener un pictograma específico
export const getPictogramById = async (id, userId = null) => {
  const pictogram = await prisma.pictogram.findUnique({
    where: { id },
  });

  if (!pictogram) throw new UserError("Pictograma no encontrado", 404);

  // Si es pictograma personal, solo su dueño puede verlo
  if (pictogram.userId && pictogram.userId !== userId)
    throw new UserError("No tienes permiso para ver este pictograma", 403);

  return pictogram;
};

// Crear un pictograma de usuario
export const createUserPictogram = async ({
  userId,
  name,
  imageUrl,
  description,
}) => {
  if (!name || !imageUrl)
    throw new UserError("Nombre e imagen obligatorios", 400);

  return await prisma.pictogram.create({
    data: {
      name,
      imageUrl,
      description: description || null,
      userId,
    },
  });
};

export const updatePictogram = async ({
  id,
  userId,
  name,
  imageUrl,
  description,
}) => {
  const pictogram = await prisma.pictogram.findUnique({ where: { id } });
  if (!pictogram) throw new UserError("Pictograma no encontrado", 404);

  // Validación: solo admin o dueño del pictograma pueden editar
  if (pictogram.userId && pictogram.userId !== userId)
    throw new UserError("No tienes permiso para editar este pictograma", 403);

  return await prisma.pictogram.update({
    where: { id },
    data: {
      name: name || pictogram.name,
      imageUrl: imageUrl || pictogram.imageUrl,
      description: description ?? pictogram.description,
    },
  });
};

export const deletePictogram = async ({ id, userId }) => {
  const pictogram = await prisma.pictogram.findUnique({ where: { id } });
  if (!pictogram) throw new UserError("Pictograma no encontrado", 404);

  // Validación: solo admin o dueño del pictograma pueden borrar
  if (pictogram.userId && pictogram.userId !== userId)
    throw new UserError("No tienes permiso para borrar este pictograma", 403);

  return await prisma.pictogram.delete({ where: { id } });
};
