import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import speakerRoutes from "./routes/speaker.routes.js";
import gridRoutes from "./routes/grid.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", speakerRoutes);
app.use("/api/speaker", speakerRoutes);
app.use("/api/grids", gridRoutes);

export default app;
