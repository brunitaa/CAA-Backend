import prisma from "../lib/prisma.js";

export const statsRepository = {
  getTotalPictograms: () => prisma.pictogram.count(),

  getTotalUsers: () =>
    prisma.user.count({
      where: { isActive: true },
    }),

  getUploadsLast7Days: () =>
    prisma.pictogram.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

  getPOSDistribution: async () => {
    const posStats = await prisma.pictogramPos.groupBy({
      by: ["posId"],
      _count: { posId: true },
    });

    const categories = await prisma.partOfSpeech.findMany({
      where: { id: { in: posStats.map((p) => p.posId) } },
    });

    return posStats.map((stat) => {
      const cat = categories.find((c) => c.id === stat.posId);
      return {
        category: cat?.name || "Sin categoría",
        count: stat._count.posId,
      };
    });
  },

  getRecentUploads: () =>
    prisma.pictogram.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { image: true },
    }),

  getUploadsByDay: () =>
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Pictogram"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC;
    `,
};
