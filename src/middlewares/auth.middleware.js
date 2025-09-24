import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { ROLE_IDS } from "../services/auth.service.js";

export const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
};

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

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a administradores" });
  }
  next();
};

export const authorizeUpdateUser = () => {
  return async (req, res, next) => {
    try {
      const requester = req.user; // { userId, role }
      const targetUserId = parseInt(req.params.id, 10);

      // Admin siempre puede
      if (requester.role === "admin") return next();

      // Caregiver -> puede editarse a sí mismo o a sus speakers
      if (requester.role === "caregiver") {
        if (requester.userId === targetUserId) return next();

        const relation = await prisma.speakerCaregiver.findFirst({
          where: {
            caregiverId: requester.userId,
            speakerId: targetUserId,
          },
        });
        if (relation) return next();

        return res
          .status(403)
          .json({ message: "No autorizado para editar este usuario" });
      }

      // Speaker -> solo puede editarse a sí mismo
      if (requester.role === "speaker") {
        if (requester.userId === targetUserId) return next();
        return res
          .status(403)
          .json({ message: "No autorizado para editar este usuario" });
      }

      return res.status(403).json({ message: "Rol no autorizado" });
    } catch (err) {
      console.error("Error en authorizeUpdateUser:", err);
      res.status(500).json({ message: err.message });
    }
  };
};
