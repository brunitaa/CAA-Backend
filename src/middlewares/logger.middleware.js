import fs from "fs";
import path from "path";

export const logger = (req, res, next) => {
  const logFile = path.join("logs", "app.log");
  const log = `${new Date().toISOString()} | ${req.method} ${
    req.url
  } | userId: ${req.user?.userId || "guest"}\n`;

  fs.appendFile(logFile, log, (err) => {
    if (err) console.error("Error escribiendo log:", err);
  });

  next();
};

// src/middlewares/error.middleware.js
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Error interno del servidor",
  });
};
