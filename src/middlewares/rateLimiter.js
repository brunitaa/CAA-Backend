// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

export const ipRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later" },
});
