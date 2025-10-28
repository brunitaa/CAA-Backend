import prisma from "../lib/prisma.js";

export const statsService = {
  getDashboardStats: async () => {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const activeSessions = await prisma.userSession.count({
      where: { endedAt: null },
    });
    const totalPictograms = await prisma.pictogram.count();

    const today = new Date();
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - i);
        return d.toISOString().slice(0, 10);
      })
      .reverse();

    const activityStats = await Promise.all(
      last7Days.map(async (date) => {
        const uploads = await prisma.pictogram.count({
          where: {
            createdAt: {
              gte: new Date(date + "T00:00:00.000Z"),
              lt: new Date(date + "T23:59:59.999Z"),
            },
          },
        });
        return { date, uploads };
      })
    );

    const categoryDataRaw = await prisma.partOfSpeech.findMany({
      select: { name: true, pictogramPos: true },
    });

    const categoryData = categoryDataRaw.map((cat) => ({
      category: cat.name,
      count: cat.pictogramPos.length,
    }));

    const recentUploadsRaw = await prisma.pictogram.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        image: true,
      },
    });

    const recentUploads = recentUploadsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      imageId: p.imageId,
      userId: p.userId,
      lemma: p.lemma,
      createdBy: p.createdBy,
      usageFrequency: p.usageFrequency.toString(),
      isActive: p.isActive,
      deletedAt: p.deletedAt,
      isMultiword: p.isMultiword,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      image: p.image
        ? {
            id: p.image.id,
            url: p.image.url,
            filesize: p.image.filesize,
            height: p.image.height,
            width: p.image.width,
            mimeType: p.image.mimeType,
            userId: p.image.userId,
            createdAt: p.image.createdAt,
          }
        : null,
    }));

    return {
      success: true,
      stats: {
        totalPictograms,
        totalUsers,
        activeUsers,
        activeSessions,
        uploadsLast7Days: activityStats.reduce(
          (acc, curr) => acc + curr.uploads,
          0
        ),
        activityStats,
        categoryData,
        recentUploads,
      },
    };
  },
};
