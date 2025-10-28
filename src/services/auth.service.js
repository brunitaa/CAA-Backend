import prisma from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "./email.service.js";
import { AppError } from "../errors/app.errors.js";

const EMAIL_VERIFICATION_TTL = 5 * 60 * 1000;
const PASSWORD_RESET_TTL = 15 * 60 * 1000;

export const ROLE_IDS = {
  ADMIN: 1,
  CAREGIVER: 2,
  SPEAKER: 3,
};

export class AuthService {
  _roleNameFromId(roleId) {
    if (roleId === ROLE_IDS.ADMIN) return "admin";
    if (roleId === ROLE_IDS.CAREGIVER) return "caregiver";
    if (roleId === ROLE_IDS.SPEAKER) return "speaker";
    return "user";
  }

  async _createAndSendAuthToken({ userId, email, purpose, ttl }) {
    const token = generateOTP();

    // Invalidar tokens anteriores si es password reset
    if (purpose === "PASSWORD_RESET") {
      await prisma.authToken.updateMany({
        where: { userId, purpose, isUsed: false },
        data: { isUsed: true },
      });
    }

    await prisma.authToken.create({
      data: {
        userId,
        tokenHash: token,
        purpose,
        expiresAt: new Date(Date.now() + ttl),
        meta: { email },
      },
    });

    await sendOTPEmail(email, token);
    return { token };
  }
  async registerAdmin({ email, username, password, creatorId }) {
    if (!email || !username || !password)
      throw new AppError("Faltan campos", 400);

    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator || creator.roleId !== ROLE_IDS.ADMIN)
      throw new AppError("No autorizado", 403);

    if (await prisma.userAuth.findUnique({ where: { email } }))
      throw new AppError("Email ya registrado", 400);
    if (await prisma.user.findUnique({ where: { username } }))
      throw new AppError("Username ya usado", 400);

    const { hash, salt } = await hashPassword(password);

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

    await this._createAndSendAuthToken({
      userId: user.id,
      email,
      purpose: "EMAIL_VERIFICATION",
      ttl: EMAIL_VERIFICATION_TTL,
    });

    return { message: "Admin registrado. OTP enviado al correo", email };
  }

  async registerCaregiver({ email, username, password }) {
    if (!email || !username || !password)
      throw new AppError("Campos requeridos", 400);

    if (await prisma.userAuth.findUnique({ where: { email } }))
      throw new AppError("Email ya registrado", 400);
    if (await prisma.user.findUnique({ where: { username } }))
      throw new AppError("Username ya usado", 400);

    const { hash, salt } = await hashPassword(password);

    const user = await prisma.user.create({
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
      include: { auth: true },
    });

    await this._createAndSendAuthToken({
      userId: user.id,
      email,
      purpose: "EMAIL_VERIFICATION",
      ttl: EMAIL_VERIFICATION_TTL,
    });

    return {
      success: true,
      message: "Caregiver registrado. OTP enviado al correo",
      email,
    };
  }

  async loginAdmin({ email, password }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new AppError("Credenciales inválidas", 401);
    if (!userAuth.emailConfirmed)
      throw new AppError("Email no confirmado", 403);
    if (userAuth.user.roleId !== ROLE_IDS.ADMIN)
      throw new AppError("No autorizado", 403);

    const valid = await comparePassword(
      password,
      userAuth.passwordHash,
      userAuth.passwordSalt
    );
    if (!valid) throw new AppError("Credenciales inválidas", 401);

    const session = await prisma.userSession.create({
      data: { userId: userAuth.user.id },
    });

    const token = signToken({
      userId: userAuth.user.id,
      role: "admin",
      username: userAuth.user.username,
    });

    return { token, sessionId: session.id, userId: userAuth.user.id };
  }

  async loginCaregiver({ email, password }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new AppError("Credenciales inválidas", 401);
    if (!userAuth.emailConfirmed)
      throw new AppError("Email no confirmado", 403);

    const valid = await comparePassword(
      password,
      userAuth.passwordHash,
      userAuth.passwordSalt
    );
    if (!valid) throw new AppError("Credenciales inválidas", 401);

    if (![ROLE_IDS.CAREGIVER, ROLE_IDS.SPEAKER].includes(userAuth.user.roleId))
      throw new AppError("No autorizado", 403);

    const session = await prisma.userSession.create({
      data: { userId: userAuth.userId },
    });

    const token = signToken({
      userId: userAuth.userId,
      role: this._roleNameFromId(userAuth.user.roleId),
      username: userAuth.user.username,
      allowCustomization: userAuth.user.allowCustomization, // ✅ corregido
    });

    return { token, sessionId: session.id, userId: userAuth.userId };
  }

  async verifyOtp({ email, otp, purpose = "EMAIL_VERIFICATION" }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new AppError("Usuario no encontrado", 404);

    const otpRecord = await prisma.authToken.findFirst({
      where: {
        userId: userAuth.userId,
        tokenHash: otp,
        purpose,
        isUsed: false,
      },
    });

    if (!otpRecord) throw new AppError("OTP inválido o ya usado", 400);
    if (otpRecord.expiresAt < new Date())
      throw new AppError("OTP expirado", 400);

    await prisma.authToken.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    if (purpose === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { id: userAuth.userId },
        data: { isActive: true },
      });
      await prisma.userAuth.update({
        where: { email },
        data: { emailConfirmed: true },
      });
    }

    const jwtToken = signToken({
      userId: userAuth.userId,
      role: this._roleNameFromId(userAuth.user.roleId),
      username: userAuth.user.username,
    });

    return { token: jwtToken, userId: userAuth.userId };
  }

  async resendOTP({ email, purpose = "EMAIL_VERIFICATION" }) {
    if (!email) throw new AppError("Email es requerido", 400);

    const userAuth = await prisma.userAuth.findUnique({ where: { email } });
    if (!userAuth) throw new AppError("Email no registrado", 404);

    await this._createAndSendAuthToken({
      userId: userAuth.userId,
      email,
      purpose,
      ttl:
        purpose === "PASSWORD_RESET"
          ? PASSWORD_RESET_TTL
          : EMAIL_VERIFICATION_TTL,
    });

    return { success: true, message: "OTP reenviado", email };
  }

  async requestPasswordToken(email) {
    const userAuth = await prisma.userAuth.findUnique({ where: { email } });
    if (!userAuth) throw new AppError("Email no registrado", 404);

    await this._createAndSendAuthToken({
      userId: userAuth.userId,
      email,
      purpose: "PASSWORD_RESET",
      ttl: PASSWORD_RESET_TTL,
    });

    return { message: "Token enviado al correo" };
  }

  async resetPasswordWithToken({ email, token, newPassword }) {
    const userAuth = await prisma.userAuth.findUnique({ where: { email } });
    if (!userAuth) throw new AppError("Usuario no encontrado", 404);

    const tokenRecord = await prisma.authToken.findFirst({
      where: {
        userId: userAuth.userId,
        tokenHash: token,
        purpose: "PASSWORD_RESET",
        isUsed: false,
      },
    });

    if (!tokenRecord) throw new AppError("Token inválido o usado", 400);
    if (tokenRecord.expiresAt < new Date())
      throw new AppError("Token expirado", 400);

    const { hash, salt } = await hashPassword(newPassword);

    await prisma.userAuth.update({
      where: { email },
      data: { passwordHash: hash, passwordSalt: salt },
    });

    await prisma.authToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    return { message: "Contraseña actualizada correctamente" };
  }

  async logout(sessionId) {
    if (!sessionId) return { message: "No session id provided" };
    try {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      });
    } catch {}
    return { message: "Sesión cerrada" };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { auth: true, role: true },
    });
    if (!user) throw new AppError("Usuario no encontrado", 404);

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
