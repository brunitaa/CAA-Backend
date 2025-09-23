import prisma from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "./email.service.js";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos

export const ROLE_IDS = {
  ADMIN: 1,
  CAREGIVER: 2,
  SPEAKER: 3,
};

export class AuthService {
  /** ================== ADMIN ================== */

  async registerAdmin({ email, username, password, creatorId }) {
    // Validación de campos
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!username) missingFields.push("username");
    if (!password) missingFields.push("password");
    if (missingFields.length)
      throw new Error(
        `Faltan los siguientes campos: ${missingFields.join(", ")}`
      );

    // Verificar que el creador sea admin
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator || creator.roleId !== ROLE_IDS.ADMIN)
      throw new Error("No autorizado");

    // Revisar email y username
    const existingEmail = await prisma.userAuth.findUnique({
      where: { email },
    });
    if (existingEmail) throw new Error("Email ya registrado");

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) throw new Error("Username ya usado");

    // Hash de la contraseña
    const { hash, salt } = await hashPassword(password);

    // Crear usuario admin inactivo
    const user = await prisma.user.create({
      data: {
        username,
        roleId: ROLE_IDS.ADMIN,
        isActive: false,
        auth: {
          create: {
            email,
            passwordHash: hash,
            passwordSalt: salt,
            emailConfirmed: false,
          },
        },
      },
      include: { auth: true },
    });

    // Generar OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.OTP.upsert({
      where: { email },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, createdAt: new Date() },
    });

    await sendOTPEmail(email, otp);

    return { message: "Admin registrado. OTP enviado al correo", email };
  }

  async verifyAdminOTP({ email, otp }) {
    const record = await prisma.OTP.findUnique({ where: { email } });
    if (!record) throw new Error("OTP no encontrado");
    if (record.otp !== otp) throw new Error("OTP inválido");

    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new Error("Usuario no encontrado");

    await prisma.user.update({
      where: { id: userAuth.userId },
      data: { isActive: true },
    });
    await prisma.userAuth.update({
      where: { email },
      data: { emailConfirmed: true },
    });
    await prisma.OTP.delete({ where: { email } });

    const token = signToken({
      userId: userAuth.userId,
      role: "admin",
      username: userAuth.user.username,
    });

    return { token, userId: userAuth.userId };
  }

  async loginAdmin({ email, password }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new Error("Credenciales inválidas");
    if (!userAuth.emailConfirmed) throw new Error("Email no confirmado");

    const valid = await comparePassword(
      password,
      userAuth.passwordHash,
      userAuth.passwordSalt
    );
    if (!valid) throw new Error("Credenciales inválidas");

    if (userAuth.user.roleId !== ROLE_IDS.ADMIN)
      throw new Error("No autorizado");

    const token = signToken({
      userId: userAuth.user.id,
      role: "admin",
      username: userAuth.user.username,
    });

    const session = await prisma.userSession.create({
      data: { userId: userAuth.user.id },
    });

    return { token, sessionId: session.id, userId: userAuth.user.id };
  }

  /** ================== CAREGIVER ================== */

  async registerCaregiver({ email, username, password }) {
    if (!email || !username || !password) throw new Error("Campos requeridos");

    if (await prisma.userAuth.findUnique({ where: { email } })) {
      throw new Error("Email ya registrado");
    }
    if (await prisma.user.findUnique({ where: { username } })) {
      throw new Error("Username ya usado");
    }

    const { hash, salt } = await hashPassword(password);

    await prisma.user.create({
      data: {
        username,
        roleId: ROLE_IDS.CAREGIVER,
        isActive: false,
        auth: {
          create: {
            email,
            passwordHash: hash,
            passwordSalt: salt,
            emailConfirmed: false,
          },
        },
      },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.oTP.upsert({
      where: { email },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, createdAt: new Date() },
    });

    await sendOTPEmail(email, otp);

    return { message: "OTP enviado", email };
  }

  async verifyOTP({ email, otp }) {
    const record = await prisma.oTP.findUnique({ where: { email } });
    if (!record) throw new Error("OTP no encontrado");
    if (record.otp !== otp) throw new Error("OTP inválido");
    if (record.expiresAt < new Date()) throw new Error("OTP expirado");

    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new Error("Usuario no encontrado");

    await prisma.user.update({
      where: { id: userAuth.userId },
      data: { isActive: true },
    });
    await prisma.userAuth.update({
      where: { email },
      data: { emailConfirmed: true },
    });
    await prisma.oTP.delete({ where: { email } });

    const token = signToken({
      userId: userAuth.userId,
      role: "caregiver",
      username: userAuth.user.username,
    });

    return { token, userId: userAuth.userId };
  }

  async loginCaregiver({ email, password }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new Error("Credenciales inválidas");
    if (!userAuth.emailConfirmed) throw new Error("Email no confirmado");

    const valid = await comparePassword(
      password,
      userAuth.passwordHash,
      userAuth.passwordSalt
    );
    if (!valid) throw new Error("Credenciales inválidas");

    const token = signToken({
      userId: userAuth.userId,
      role: "caregiver",
      username: userAuth.user.username,
    });

    const session = await prisma.userSession.create({
      data: { userId: userAuth.userId },
    });

    return { token, sessionId: session.id, userId: userAuth.userId };
  }

  /** ================== LOGOUT & OTP ================== */

  async logout(sessionId) {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
    return { message: "Sesión cerrada" };
  }

  async resendOTP({ email }) {
    const user = await prisma.userAuth.findUnique({ where: { email } });
    if (!user) throw new Error("Email no registrado");

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.oTP.upsert({
      where: { email },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, createdAt: new Date() },
    });

    await sendOTPEmail(email, otp);
    return { message: "OTP reenviado", email };
  }

  async requestPasswordOTP(email) {
    const userAuth = await prisma.userAuth.findUnique({ where: { email } });
    if (!userAuth) throw new Error("Email no registrado");

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.OTP.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        email,
        otp,
        expiresAt,
        createdAt: new Date(),
      },
    });

    await sendOTPEmail(email, otp);
    return { message: "OTP enviado al correo" };
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    const record = await prisma.OTP.findUnique({ where: { email } });
    if (!record) throw new Error("OTP no encontrado");
    if (record.otp !== otp) throw new Error("OTP incorrecto");
    if (record.expiresAt < new Date()) throw new Error("OTP expirado");

    const { hash, salt } = await hashPassword(newPassword);

    await prisma.userAuth.update({
      where: { email },
      data: { passwordHash: hash, passwordSalt: salt },
    });

    await prisma.OTP.delete({ where: { email } });

    return { message: "Contraseña actualizada correctamente" };
  }

  // Obtener perfil del usuario logueado
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        auth: true, // email
        role: true, // rol
      },
    });

    if (!user) throw new Error("Usuario no encontrado");

    return {
      id: user.id,
      username: user.username,
      email: user.auth?.email || null,
      role: user.role.name,
      gender: user.gender,
      age: user.age,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
