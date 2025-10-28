import { userRepository } from "../repositories/user.repository.js";
import { generateOTP } from "../utils/otp.js";
import { CaregiverSpeakerRepository } from "../repositories/caregiverSpeaker.repository.js";
import { sendOTPEmail } from "../services/email.service.js";
import { AppError } from "../errors/app.errors.js";
import prisma from "../lib/prisma.js";

const caregiverSpeakerRepo = new CaregiverSpeakerRepository();
class UserService {
  async toggleUserActive(userId, requester) {
    const user = await userRepository.updateUser(userId, {});
    if (!user) throw new AppError("Usuario no encontrado", 404);

    if (requester.role === "admin") {
      const updated = await userRepository.updateUser(userId, {
        isActive: !user.isActive,
      });
      return updated;
    }

    if (requester.role === "caregiver") {
      const relation = await caregiverSpeakerRepo.exists(
        requester.userId,
        userId
      );
      if (!relation) throw new AppError("No autorizado", 403);

      const updated = await userRepository.updateUser(userId, {
        isActive: !user.isActive,
      });
      return updated;
    }

    throw new AppError("Rol no autorizado", 403);
  }

  async updateSpeaker(speaker, data) {
    if (!data || Object.keys(data).length === 0)
      throw new AppError("No hay datos para actualizar", 400);

    const safeData = {};
    if (data.username) safeData.username = data.username;
    if (data.gender) safeData.gender = data.gender;
    if (data.age) safeData.age = data.age;

    if (Object.keys(safeData).length === 0)
      throw new AppError("No hay campos válidos para actualizar", 400);

    return await userRepository.updateUser(speaker.id, safeData);
  }
  async updateCaregiver(caregiver, userId, data) {
    const safeData = {};

    // Validación: solo puede editar speakers asignados o su propio perfil
    if (caregiver.id !== userId) {
      const relation = await prisma.caregiverSpeaker.findUnique({
        where: {
          caregiverId_speakerId: {
            caregiverId: caregiver.id,
            speakerId: userId,
          },
        },
      });
      if (!relation)
        throw new AppError(
          "No autorizado: este speaker no pertenece al caregiver",
          403
        );
    }

    if (data.username) safeData.username = data.username;
    if (data.gender) safeData.gender = data.gender;
    if (data.age) safeData.age = data.age;

    if (Object.keys(safeData).length === 0)
      throw new AppError("No hay campos válidos para actualizar", 400);

    return await userRepository.updateUser(userId, safeData);
  }
  async updateAdmin(admin, userId, data) {
    if (admin.id !== userId) {
      throw new AppError(
        "No autorizado: un admin solo puede editar su propio perfil",
        403
      );
    }
    console.log("b");
    console.log(data);

    if (!data || Object.keys(data).length === 0)
      throw new AppError("No hay datos para actualizar", 400);

    const safeData = {};

    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUser && existingUser.id !== userId)
        throw new AppError("El username ya está en uso", 400);
      safeData.username = data.username;
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== userId)
        throw new AppError("El correo ya está en uso", 400);
      safeData.email = data.email;
    }

    if (data.password) {
      safeData.password = data.password;
    }

    if (data.gender) safeData.gender = data.gender;
    if (data.age !== undefined) safeData.age = data.age;

    if (Object.keys(safeData).length === 0)
      throw new AppError("No hay campos válidos para actualizar", 400);

    return await userRepository.updateUser(userId, safeData);
  }

  async requestEmailChange(requester, userId, newEmail) {
    if (!(requester.role === "admin" || requester.role === "caregiver"))
      throw new AppError("No autorizado a cambiar email", 403);

    const existing = await userRepository.findUserAuthByEmail(newEmail);
    if (existing) throw new AppError("Email ya registrado", 400);

    const otp = generateOTP();
    await userRepository.requestEmailChange(userId, newEmail, otp);
    await sendEmail(newEmail, otp);

    return { message: "OTP enviado al nuevo email" };
  }

  async confirmEmailChange(requester, userId, newEmail, otp) {
    if (!(requester.role === "admin" || requester.role === "caregiver"))
      throw new AppError("No autorizado a confirmar email", 403);

    const record = await userRepository.findOTP(newEmail);
    if (!record) throw new AppError("No se encontró OTP para este email", 404);

    if (record.otp !== otp) throw new AppError("OTP inválido", 400);

    if (record.expiresAt < new Date()) throw new AppError("OTP expirado", 400);

    await userRepository.confirmEmailChange(userId, newEmail);
    await userRepository.deleteOTP(newEmail);

    return { message: "Email actualizado correctamente" };
  }

  async getAllAdmins() {
    return await prisma.user.findMany({
      where: {
        role: {
          name: "admin",
        },
      },
      select: {
        id: true,
        username: true,
        isActive: true,
        gender: true,
        age: true,
      },
    });
  }

  async getAllSpeakers() {
    return await prisma.user.findMany({
      where: {
        role: {
          name: "speaker",
        },
      },
      select: {
        id: true,
        username: true,
        isActive: true,
        gender: true,
        age: true,
      },
    });
  }

  async getAllCaregivers() {
    return await prisma.user.findMany({
      where: {
        role: {
          name: "caregiver",
        },
      },
      select: {
        id: true,
        username: true,
        isActive: true,
        gender: true,
        age: true,
      },
    });
  }
}

export const userService = new UserService();
