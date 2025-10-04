import prisma from "../lib/prisma.js";

export const getSemanticByPos = async (req, res) => {
  try {
    const { posId } = req.params;

    if (!posId) {
      return res.status(400).json({ error: "posId es requerido" });
    }

    const semantics = await prisma.pictogramSemantic.findMany({
      where: {
        pictogram: {
          pictogramPos: {
            some: {
              posId: Number(posId), // filtramos por POS
            },
          },
        },
      },
      include: {
        pictogram: {
          include: {
            pictogramPos: {
              include: { pos: true }, // opcional
            },
            image: true, // trae imágenes si las tienes relacionadas
          },
        },
        category: true, // categoría de la semántica
      },
    });

    return res.json(semantics);
  } catch (error) {
    console.error("Error en getSemanticByPos:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener semantics por POS" });
  }
};
