// services/auth.service.js
import prisma from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "./email.service.js";
import { AppError } from "../errors/app.errors.js";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos

export const ROLE_IDS = {
  ADMIN: 1,
  CAREGIVER: 2,
  SPEAKER: 3,
};

export class AuthService {
  // Helper: map roleId -> role name string (used in JWT)
  _roleNameFromId(roleId) {
    if (roleId === ROLE_IDS.ADMIN) return "admin";
    if (roleId === ROLE_IDS.CAREGIVER) return "caregiver";
    if (roleId === ROLE_IDS.SPEAKER) return "speaker";
    return "user";
  }

  // Helper: crea un authToken y lo envía por email. Reintenta si hay colisión unique.
  async _createAndSendAuthToken({ userId, email, purpose, ttl = OTP_TTL_MS }) {
    const maxAttempts = 5;
    let lastErr = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const token = generateOTP(); // devuleve string (ej: "123456")
      try {
        await prisma.authToken.create({
          data: {
            userId,
            tokenHash: token,
            purpose,
            expiresAt: new Date(Date.now() + ttl),
            meta: { email },
          },
        });

        // enviar el token (correo)
        await sendOTPEmail(email, token);

        return { token }; // devolvemos token (por si se necesita)
      } catch (err) {
        lastErr = err;
        // posible colisión en tokenHash (unique). Intentar otra vez.
        // No entramos a detalle de códigos de error, solo reintentamos.
      }
    }

    // si falla después de reintentos
    throw new Error("No se pudo generar el token. Intenta de nuevo");
  }

  async registerAdmin({ email, username, password, creatorId }) {
    // validaciones básicas
    const missing = [];
    if (!email) missing.push("email");
    if (!username) missing.push("username");
    if (!password) missing.push("password");
    if (missing.length)
      throw new AppError(`Faltan campos: ${missing.join(", ")}`, 400);

    // verificar que el creador sea admin
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator || creator.roleId !== ROLE_IDS.ADMIN)
      throw new AppError("No autorizado", 403);

    // revisar email y username
    if (await prisma.userAuth.findUnique({ where: { email } })) {
      throw new AppError("Email ya registrado", 400);
    }
    if (await prisma.user.findUnique({ where: { username } })) {
      throw new AppError("Username ya usado", 400);
    }

    // hash de contraseña
    const { hash, salt } = await hashPassword(password);

    // crear usuario con auth anidado
    const user = await prisma.user.create({
      data: {
        username,
        roleId: ROLE_IDS.ADMIN,
        isActive: false, // queda inactivo hasta confirmar email
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

    // crear y enviar authToken (EMAIL_VERIFICATION)
    await this._createAndSendAuthToken({
      userId: user.id,
      email,
      purpose: "EMAIL_VERIFICATION",
    });

    return { message: "Admin registrado. OTP enviado al correo", email };
  }

  async verifyAuthToken({ email, token }) {
    const userAuth = await prisma.userAuth.findUnique({
      where: { email },
      include: { user: true },
    });
    if (!userAuth) throw new AppError("Usuario no encontrado", 404);

    const tokenRecord = await prisma.authToken.findFirst({
      where: {
        userId: userAuth.userId,
        tokenHash: token,
        purpose: "EMAIL_VERIFICATION",
        isUsed: false,
      },
    });

    if (!tokenRecord) throw new AppError("Token inválido o ya usado", 400);
    if (tokenRecord.expiresAt < new Date())
      throw new AppError("Token expirado", 400);

    // marcar como usado
    await prisma.authToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    // activar usuario y confirmar email
    await prisma.user.update({
      where: { id: userAuth.userId },
      data: { isActive: true },
    });
    await prisma.userAuth.update({
      where: { email },
      data: { emailConfirmed: true },
    });

    // generar JWT
    const jwtToken = signToken({
      userId: userAuth.userId,
      role: this._roleNameFromId(userAuth.user.roleId),
      username: userAuth.user.username,
    });

    return { token: jwtToken, userId: userAuth.userId };
  }

  async registerCaregiver({ email, username, password }) {
    if (!email || !username || !password)
      throw new AppError("Campos requeridos", 400);

    if (await prisma.userAuth.findUnique({ where: { email } })) {
      throw new AppError("Email ya registrado", 400);
    }
    if (await prisma.user.findUnique({ where: { username } })) {
      throw new AppError("Username ya usado", 400);
    }

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
    });

    return { message: "Caregiver registrado. OTP enviado al correo", email };
  }

  async loginAdmin({ email, password }) {
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

    if (userAuth.user.roleId !== ROLE_IDS.ADMIN)
      throw new AppError("No autorizado", 403);

    // crear sesión
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

    if (
      userAuth.user.roleId !== ROLE_IDS.CAREGIVER &&
      userAuth.user.roleId !== ROLE_IDS.SPEAKER
    ) {
      // permitir caregiver (y opcionalmente speaker si quieres)
      // aquí asumo caregiver sólo
    }

    const session = await prisma.userSession.create({
      data: { userId: userAuth.userId },
    });

    const token = signToken({
      userId: userAuth.userId,
      role: this._roleNameFromId(userAuth.user.roleId),
      username: userAuth.user.username,
    });

    return { token, sessionId: session.id, userId: userAuth.userId };
  }

  async resendOTP({ email }) {
    const userAuth = await prisma.userAuth.findUnique({ where: { email } });
    if (!userAuth) throw new AppError("Email no registrado", 404);

    await this._createAndSendAuthToken({
      userId: userAuth.userId,
      email,
      purpose: "EMAIL_VERIFICATION",
    });

    return { message: "OTP reenviado", email };
  }

  async requestPasswordToken(email) {
    const userAuth = await prisma.userAuth.findFirst({ where: { email } });
    if (!userAuth) throw new AppError("Email no registrado", 404);

    await this._createAndSendAuthToken({
      userId: userAuth.userId,
      email,
      purpose: "PASSWORD_RESET",
    });

    return { message: "Token enviado al correo" };
  }

  // -------------------------
  // Resetear contraseña con token
  // -------------------------
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
    } catch (err) {
      // si no existe la sesión, ignorar
    }
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
