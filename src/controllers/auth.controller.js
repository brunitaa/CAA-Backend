import { AuthService } from "../services/auth.service.js";
import prisma from "../lib/prisma.js";

const authService = new AuthService();

// Registrar Admin
export const registerAdmin = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { email, username, password } = req.body;

    const result = await authService.registerAdmin({
      email,
      username,
      password,
      creatorId,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Verificar AuthToken Admin
export const verifyAdminToken = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const result = await authService.verifyAuthToken({ email, token });

    await prisma.user.update({
      where: { id: result.userId },
      data: { isActive: true, lastLogin: new Date() },
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Login Admin
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { token, sessionId, userId } = await authService.loginAdmin({
      email,
      password,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login exitoso", sessionId, userId });
  } catch (err) {
    next(err);
  }
};

// Registrar Caregiver
export const registerCaregiver = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const result = await authService.registerCaregiver({
      email,
      username,
      password,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Verificar AuthToken Caregiver
export const verifyTokenCaregiver = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const result = await authService.verifyAuthToken({ email, token });

    await prisma.user.update({
      where: { id: result.userId },
      data: { isActive: true, lastLogin: new Date() },
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Login Caregiver
export const loginCaregiver = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, sessionId, userId } = await authService.loginCaregiver({
      email,
      password,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login exitoso", sessionId, userId });
  } catch (err) {
    next(err);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    const result = await authService.logout(sessionId);

    res.clearCookie("token");
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Solicitar AuthToken para reseteo de contraseña
export const requestPasswordToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordToken(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña usando AuthToken
export const resetPasswordWithToken = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await authService.resetPasswordWithToken({
      email,
      token,
      newPassword,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Obtener perfil
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await authService.getProfile(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};
