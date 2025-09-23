import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import speakerRoutes from "./routes/speaker.routes.js";
import gridRoutes from "./routes/grid.routes.js";
import pictogramRoutes from "./routes/pictograms.routes.js";
import gridPictogramRoutes from "./routes/gridPictogram.routes.js";
import { bigintSerializer } from "./middlewares/bigintSerializer.middleware.js";
const app = express();
app.use(express.urlencoded({ extended: true }));
// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(bigintSerializer);

// Rutas
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", speakerRoutes);
app.use("/api/speaker", speakerRoutes);
app.use("/api/grids", gridRoutes);
app.use("/api/pictograms", pictogramRoutes);
app.use("/api/gridPictogram", gridPictogramRoutes);

export default app;
