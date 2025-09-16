import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas
import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);
import pictogramRoutes from "./routes/pictograms.routes.js";
app.use("/api/pictograms", pictogramRoutes);

export default app;
