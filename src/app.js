import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import speakerRoutes from "./routes/speaker.routes.js";
import gridRoutes from "./routes/grid.routes.js";
import posRoutes from "./routes/pos.routes.js";
import pictogramRoutes from "./routes/pictograms.routes.js";
import gridPictogramRoutes from "./routes/gridPictogram.routes.js";
import semanticRoutes from "./routes/semantic.routes.js";
import { AppError } from "./errors/app.errors.js";
import { bigintSerializer } from "./middlewares/bigintSerializer.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";
import statsRoutes from "./routes/stats.routes.js";

// Crear app
const app = express();

// Middlewares generales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bigintSerializer);
app.use(logger);
app.use(morgan("dev"));

//  CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    credentials: true,
  })
);

// Rutas
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/speaker", speakerRoutes);
//app.use("api/caregiver", caregiverRoutes);
app.use("/api/grids", gridRoutes);
app.use("/api/pictograms", pictogramRoutes);
app.use("/api/gridPictogram", gridPictogramRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/semantic", semanticRoutes);

// Servir imágenes estáticas
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err); // log para desarrollo

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Ha ocurrido un error en el servidor";

  res.status(statusCode).json({
    status,
    message,
  });
});
app.use(express.json());

export default app;
