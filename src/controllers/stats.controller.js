import { statsService } from "../services/stats.service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const data = await statsService.getDashboardStats();
    res.json(data);
  } catch (error) {
    console.error("Error in stats.controller:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard stats" });
  }
};
