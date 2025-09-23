// src/repositories/user.repository.js
import prisma from "../lib/prisma.js";

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
}
