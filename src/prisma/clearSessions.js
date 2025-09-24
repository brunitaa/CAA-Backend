// prisma/clearSessions.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Elimina todas las sesiones de usuarios
  const result = await prisma.userSession.deleteMany({});
  console.log(` ${result.count} sesiones eliminadas.`);
}

main()
  .catch((e) => {
    console.error("Error al borrar sesiones:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
