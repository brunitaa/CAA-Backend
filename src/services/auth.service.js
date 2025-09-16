import prisma from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserError from "../errors/user.error.js";

export const register = async ({ username, password, email, role }) => {
  if (!username || !password)
    throw new UserError("Username y password son requeridos", 400);

  // Verificar si username existe
  const existingUsername = await prisma.user.findFirst({ where: { username } });
  if (existingUsername) throw new UserError("El username ya está en uso", 400);

  // Verificar email solo si se envía
  if (email) {
    const existingEmail = await prisma.user.findFirst({ where: { email } });
    if (existingEmail) throw new UserError("El email ya está en uso", 400);
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: role || "usuario",
      email: email || null, // email opcional
    },
  });

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  };
};

export const createMobileUser = async ({ username, password, email }) => {
  if (!username || !password)
    throw new UserError("Username y password son requeridos", 400);

  // Verificar si username existe
  const existingUsername = await prisma.user.findFirst({ where: { username } });
  if (existingUsername) throw new UserError("El username ya está en uso", 400);

  // Verificar email solo si se envía
  if (email) {
    const existingEmail = await prisma.user.findFirst({ where: { email } });
    if (existingEmail) throw new UserError("El email ya está en uso", 400);
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario con rol "usuario"
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: "usuario",
      email: email || null,
    },
  });

  // Devolver credenciales para que el admin se las entregue
  return {
    username: newUser.username,
    password, // la contraseña en claro para entregar al usuario
    email: newUser.email,
    role: newUser.role,
  };
};

export const login = async ({ username, password }) => {
  if (!username || !password)
    throw new UserError("Username y password son requeridos", 400);

  // Buscar usuario por username
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) throw new UserError("Usuario no encontrado", 404);

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UserError("Contraseña incorrecta", 401);

  // Generar token JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export const logout = async () => {
  return { msg: "Logout exitoso, elimina el token en el cliente" };
};
