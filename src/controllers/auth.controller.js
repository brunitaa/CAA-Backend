import { AuthService, ROLE_IDS } from "../services/auth.service.js";
import prisma from "../lib/prisma.js";

const authService = new AuthService();

/** ================== ADMIN ================== */

// Registrar Admin (requiere JWT de otro Admin)
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

// Verificar OTP Admin
export const verifyAdminOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyAdminOTP({ email, otp });

    // Actualizar lastLogin
    await prisma.user.update({
      where: { id: result.userId },
      data: { lastLogin: new Date() },
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
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

/** ================== CAREGIVER ================== */

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

// Verificar OTP Caregiver
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP({ email, otp });

    // Actualizar lastLogin
    await prisma.user.update({
      where: { id: result.userId },
      data: { lastLogin: new Date() },
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
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({ message: "Login exitoso", sessionId, userId });
  } catch (err) {
    next(err);
  }
};

/** ================== LOGOUT ================== */

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

/** ================== OTP ================== */

// Reenviar OTP a Caregiver
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOTP({ email });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Solicitar OTP para reset de contraseña
export const requestPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordOTP(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña con OTP
export const resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPasswordWithOTP(
      email,
      otp,
      newPassword
    );
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
