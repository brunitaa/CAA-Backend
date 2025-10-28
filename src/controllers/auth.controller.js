import { AuthService } from "../services/auth.service.js";
import prisma from "../lib/prisma.js";

const authService = new AuthService();

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

export const verifyOtpCaregiver = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError("Email y OTP son requeridos", 400);
    }

    // Llamamos al servicio de auth que valida el OTP
    const result = await authService.verifyOtp({ email, otp });

    // Actualizar usuario como activo y registrar último login
    await prisma.user.update({
      where: { id: result.userId },
      data: { isActive: true, lastLogin: new Date() },
    });

    // Enviar JWT en cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json({
      success: true,
      message: "OTP verificado correctamente",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

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

    res.json({ message: "Login exitoso!", sessionId, userId, token });
  } catch (err) {
    next(err);
  }
};

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

export const requestPasswordToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordToken(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

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

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await authService.getProfile(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email es requerido" });
    }
    const result = await authService.resendOTP({ email });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error del servidor" });
  }
};
