import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export const signToken = (payload, expiresIn = "30d") => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

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
