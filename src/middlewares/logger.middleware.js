import fs from "fs";
import path from "path";

export const logger = (req, res, next) => {
  const logDir = "logs";
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const logFile = path.join(logDir, "app.log");

  res.on("finish", () => {
    const status = res.statusCode;
    const logType = status >= 400 ? "ERROR" : "INFO";
    const log = `${new Date().toISOString()} | ${logType} | ${req.method} ${
      req.url
    } | status: ${status} | userId: ${req.user?.userId || "guest"}\n`;

    fs.appendFile(logFile, log, (err) => {
      if (err) console.error("Error escribiendo log:", err);
    });
  });

  next();
};

export const errorHandler = (err, req, res, next) => {
  const logFile = path.join("logs", "errors.log");
  const errorLog = `${new Date().toISOString()} | CRITICAL | ${req.method} ${
    req.url
  } | userId: ${req.user?.userId || "guest"} | error: ${err.message}\nStack: ${
    err.stack
  }\n\n`;

  fs.appendFile(logFile, errorLog, (fsErr) => {
    if (fsErr) console.error("Error escribiendo log de errores:", fsErr);
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
};
