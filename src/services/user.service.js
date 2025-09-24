import { userRepository } from "../repositories/user.repository.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../services/email.service.js";
import { AppError } from "../errors/app.errors.js";
import prisma from "../lib/prisma.js";
class UserService {
  // Actualización de datos básicos
  async updateUser(requester, userId, data) {
    if (!data || Object.keys(data).length === 0)
      throw new AppError("No hay datos para actualizar", 400);

    // Nunca permitir editar rol ni contraseña
    if ("roleId" in data || "password" in data)
      throw new AppError("No permitido editar rol o contraseña", 403);

    const safeData = {};

    // Validar username único
    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("El username ya está en uso", 400);
      }
      safeData.username = data.username;
    }

    if (data.gender) safeData.gender = data.gender;
    if (data.age && requester.role === "speaker" && requester.id === userId)
      safeData.age = data.age;

    if (
      data.isActive !== undefined &&
      (requester.role === "admin" || requester.role === "caregiver")
    ) {
      safeData.isActive = data.isActive;
    }

    if (Object.keys(safeData).length === 0)
      throw new AppError("No hay campos válidos para actualizar", 400);

    // PERMISOS

    // Speaker solo puede editar su propio perfil
    if (requester.role === "speaker" && requester.id !== userId) {
      throw new AppError(
        "No autorizado: un speaker solo puede editar su propio perfil",
        403
      );
    }

    // Caregiver solo puede editar su perfil o speakers asignados
    if (requester.role === "caregiver" && requester.id !== userId) {
      const relation = await prisma.caregiverSpeaker.findUnique({
        where: {
          caregiverId_speakerId: {
            caregiverId: requester.id,
            speakerId: userId,
          },
        },
      });

      if (!relation) {
        throw new AppError(
          "No autorizado: este speaker no pertenece al caregiver",
          403
        );
      }
    }

    // Admin puede editar cualquier usuario (sin restricciones)

    // Actualizar en base de datos
    return await userRepository.updateUser(userId, safeData);
  }

  // Solicitar cambio de email
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

  // Confirmar cambio de email
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
}

export const userService = new UserService();
