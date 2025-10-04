import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Eliminando todos los pictogramas y grids...");

  // Elimina relaciones
  await prisma.pictogramPos.deleteMany();
  await prisma.pictogramSemantic.deleteMany();
  await prisma.gridPictogram.deleteMany();

  // Elimina datos principales
  await prisma.pictogram.deleteMany();
  await prisma.grid.deleteMany();

  // 🔄 Reinicia los IDs
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Pictogram_id_seq" RESTART WITH 1`
  );
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Grid_id_seq" RESTART WITH 1`);

  console.log("🎉 Proceso completado");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
