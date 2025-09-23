import { AuthService, ROLE_IDS } from "../services/auth.service.js";

const authService = new AuthService();

/** ================== ADMIN ================== */

// Registrar Admin (requiere JWT de otro Admin)
export const registerAdmin = async (req, res) => {
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
    res.status(400).json({ message: err.message });
  }
};

// Verificar OTP Admin
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyAdminOTP({ email, otp });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, sessionId, userId } = await authService.loginAdmin({
      email,
      password,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login exitoso", sessionId, userId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** ================== CAREGIVER ================== */

// 📌 Registrar Caregiver
export const registerCaregiver = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const result = await authService.registerCaregiver({
      email,
      username,
      password,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Verificar OTP (Caregiver)
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyOTP({ email, otp });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Login Caregiver
export const loginCaregiver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, sessionId, userId } = await authService.loginCaregiver({
      email,
      password,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({ message: "Login exitoso", sessionId, userId });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

/** ================== SPEAKER ================== */

// 📌 Crear Speaker (solo un Caregiver puede hacerlo)
export const createSpeaker = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res
        .status(403)
        .json({ message: "Solo un Caregiver puede crear Speakers" });
    }

    const caregiverId = req.user.userId;
    const { username, gender, age } = req.body;

    const result = await authService.createSpeaker(
      { username, gender, age },
      caregiverId
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Seleccionar Speaker (solo un Caregiver puede hacerlo)
export const selectSpeaker = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res
        .status(403)
        .json({ message: "Solo un Caregiver puede seleccionar Speakers" });
    }

    const caregiverId = req.user.userId;
    const { speakerId } = req.body;

    const result = await authService.selectSpeaker({ caregiverId, speakerId });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** ================== LOGOUT ================== */

// 📌 Logout (Admin o Caregiver)
export const logout = async (req, res) => {
  try {
    const sessionId = req.sessionId;
    const result = await authService.logout(sessionId);

    res.clearCookie("token");
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/** ================== OTP ================== */

// 📌 Reenviar OTP a Caregiver
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await authService.resendOTP({ email });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const requestPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordOTP(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPasswordWithOTP(
      email,
      otp,
      newPassword
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // JWT contiene userId
    const profile = await authService.getProfile(userId);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
