import prisma from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Registro (auto-registro o admin)
export const register = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser)
      return res.status(400).json({ message: "El username ya está en uso" });

    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail)
        return res.status(400).json({ message: "El email ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || "usuario",
        email,
      },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    res
      .status(500)
      .json({ message: "Error en register", error: error.message });
  }
};

// Crear usuario móvil (solo admin)
export const createMobileUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Validación básica
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username y password son requeridos" });

    // Verificar si username existe
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser)
      return res.status(400).json({ message: "El username ya está en uso" });

    // Verificar si email existe solo si se proporciona
    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail)
        return res.status(400).json({ message: "El email ya está en uso" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con rol "usuario" (por defecto)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || "usuario",
        email: email || null, // email opcional
      },
    });

    // Devolver credenciales para que el admin se las entregue al usuario móvil
    res.status(201).json({
      message: "Usuario móvil creado correctamente",
      user: {
        username: user.username,
        password, // la contraseña en claro para entregar al usuario
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en createMobileUser:", error);
    res
      .status(500)
      .json({ message: "Error al crear usuario móvil", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Enviar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en login", error: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout exitoso" });
};

// Perfil
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ user });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res
      .status(500)
      .json({ message: "Error al obtener perfil", error: error.message });
  }
};
