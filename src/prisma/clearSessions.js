// prisma/clearSessions.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Borra todas las filas y reinicia el ID autoincremental
  const result = await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "UserSession" RESTART IDENTITY CASCADE;
  `);

  console.log("Sesiones eliminadas y secuencia reiniciada (ID volverá a 1).");
}

main()
  .catch((e) => {
    console.error("Error al borrar sesiones:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
