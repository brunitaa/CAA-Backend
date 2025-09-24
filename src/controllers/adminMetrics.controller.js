import prisma from "../lib/prisma.js";

export const getAdminMetrics = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") throw new Error("No autorizado");

    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const totalPictograms = await prisma.pictogram.count({
      where: { isActive: true },
    });
    const topPictograms = await prisma.pictogram.findMany({
      orderBy: { usageFrequency: "desc" },
      take: 10,
      select: { id: true, name: true, usageFrequency: true },
    });
    const lastLogins = await prisma.user.findMany({
      select: { username: true, lastLogin: true },
      orderBy: { lastLogin: "desc" },
      take: 10,
    });

    res.json({ totalUsers, totalPictograms, topPictograms, lastLogins });
  } catch (err) {
    next(err);
  }
};
