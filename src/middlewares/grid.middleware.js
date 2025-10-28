export const authorizeGridAccess = (roleCheck) => async (req, res, next) => {
  const { userId, role } = req.user;
  const { gridId } = req.params;

  try {
    const grid = await prisma.grid.findUnique({
      where: { id: parseInt(gridId) },
    });
    if (!grid) return res.status(404).json({ message: "Grid no encontrado" });

    if (roleCheck === "caregiver" && role !== "caregiver") {
      return res
        .status(403)
        .json({ message: "Solo caregiver puede modificar grids" });
    }

    if (roleCheck === "speaker" && grid.userId !== userId) {
      return res
        .status(403)
        .json({ message: "No autorizado para acceder a este grid" });
    }

    req.grid = grid;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
