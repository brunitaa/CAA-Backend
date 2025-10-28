import prisma from "../lib/prisma.js";

export const createSession = async (userId, deviceInfo) => {
  return prisma.userSession.create({
    data: { userId, deviceInfo },
  });
};

export const closeSession = async (sessionId) => {
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new Error("Sesión no encontrada");

  return prisma.userSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      durationSeconds: Math.floor((new Date() - session.startedAt) / 1000),
    },
  });
};
