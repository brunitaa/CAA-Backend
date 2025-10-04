// src/controllers/stats.controller.js
import { statsService } from "../services/stats.service.js";

export const statsController = {
  async getDashboard(req, res, next) {
    try {
      const stats = await statsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
