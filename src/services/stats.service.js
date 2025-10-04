// src/services/stats.service.js
import { statsRepository } from "../repositories/stats.repository.js";

export const statsService = {
  async getDashboardStats() {
    const [
      totalPictograms,
      totalUsers,
      uploadsLast7Days,
      categoryData,
      recentUploads,
      uploadsByDay,
    ] = await Promise.all([
      statsRepository.getTotalPictograms(),
      statsRepository.getTotalUsers(),
      statsRepository.getUploadsLast7Days(),
      statsRepository.getPOSDistribution(),
      statsRepository.getRecentUploads(),
      statsRepository.getUploadsByDay(),
    ]);

    const avgPerDay = Math.round((uploadsLast7Days / 7) * 10) / 10;

    // Normalizar uploadsByDay a los últimos 7 días
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // fechas de hace 6 días a hoy
      return d.toISOString().split("T")[0];
    });

    const activityStats = last7Days.map((d) => {
      const found = uploadsByDay.find(
        (u) => u.date.toISOString().split("T")[0] === d
      );
      return { date: d, uploads: found ? Number(found.count) : 0 };
    });

    return {
      totalPictograms,
      totalUsers,
      uploadsLast7Days,
      avgPerDay,
      categoryData,
      recentUploads,
      activityStats,
    };
  },
};
