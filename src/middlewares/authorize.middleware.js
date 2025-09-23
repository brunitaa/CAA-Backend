// src/middlewares/authorize.middleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { ROLE_IDS } from "../services/auth.service.js"; // Los roles fijos

export const authorizeRole =
  (allowedRoles = []) =>
  async (req, res, next) => {
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No autorizado" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Para debug: ver el payload y roles permitidos
      console.log("JWT payload:", payload);
      console.log("Roles permitidos:", allowedRoles);

      // Convertimos el payload.role a string si fuera un ID (en caso de usar ROLE_IDS)
      let roleName = payload.role;
      if (typeof payload.role === "number") {
        roleName = Object.keys(ROLE_IDS).find(
          (key) => ROLE_IDS[key] === payload.role
        );
      }

      if (allowedRoles.length && !allowedRoles.includes(roleName)) {
        return res.status(403).json({ message: "No autorizado para este rol" });
      }

      req.user = payload;

      const session = await prisma.userSession.findFirst({
        where: { userId: payload.userId, endedAt: null },
      });
      if (!session)
        return res.status(401).json({ message: "Sesión no activa" });

      req.sessionId = session.id;
      next();
    } catch (err) {
      console.error("Error en authorizeRole:", err);
      res.status(401).json({ message: "Token inválido" });
    }
  };
