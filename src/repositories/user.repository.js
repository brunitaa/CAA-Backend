// src/repositories/user.repository.js
import prisma from "../lib/prisma.js";
import { AppError } from "../errors/app.errors.js";

export class UserRepository {
  async findByEmail(email) {
    return prisma.userAuth.findUnique({ where: { email } });
  }

  async findByUsername(username) {
    return prisma.user.findUnique({ where: { username } });
  }

  async createUser({
    email,
    username,
    passwordHash,
    passwordSalt,
    role,
    gender,
  }) {
    return prisma.user.create({
      data: {
        username,
        roleId: undefined, // será asignado después según role
        isActive: false,
        gender: gender || undefined, // solo obligatorio si se pasa
        auth: {
          create: {
            email,
            passwordHash,
            passwordSalt,
            emailConfirmed: false,
          },
        },
      },
    });
  }

  async save(user) {
    return prisma.user.create({ data: user });
  }
  async updateUser(userId, safeData) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: safeData,
        include: { auth: true, role: true },
      });
    } catch (err) {
      if (err.code === "P2025") {
        throw new AppError(`Usuario con id ${userId} no existe`, 404);
      }
      throw err;
    }
  }

  async requestEmailChange(userId, newEmail, otp) {
    try {
      await prisma.oTP.create({
        data: {
          email: newEmail,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        },
      });
    } catch (err) {
      throw new AppError("No se pudo generar OTP", 500);
    }
  }

  async confirmEmailChange(userId, newEmail) {
    try {
      return await prisma.userAuth.update({
        where: { userId },
        data: { email: newEmail },
      });
    } catch (err) {
      if (err.code === "P2025") {
        throw new AppError(
          `Usuario con id ${userId} no tiene auth registrada`,
          404
        );
      }
      throw err;
    }
  }

  async findUserAuthByEmail(email) {
    return await prisma.userAuth.findUnique({ where: { email } });
  }

  async findOTP(email) {
    return await prisma.oTP.findUnique({ where: { email } });
  }

  async deleteOTP(email) {
    return await prisma.oTP.delete({ where: { email } });
  }
}
export const userRepository = new UserRepository();
