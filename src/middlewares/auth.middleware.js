import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Acceso restringido a administradores" });
  next();
};
