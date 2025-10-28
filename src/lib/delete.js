// scripts/clearDatabase.js
import prisma from "../lib/prisma.js";

async function clearDatabase() {
  try {
    console.log(" Limpiando la base de datos...");

    // Primero borrar relaciones dependientes
    await prisma.gridPictogram.deleteMany({});
    await prisma.pictogramPos.deleteMany({});
    await prisma.MLPrediction.deleteMany({});
    await prisma.MLTrainingData.deleteMany({});
    await prisma.UserStatistics.deleteMany({});
    await prisma.Sentence.deleteMany({});
    await prisma.UserSession.deleteMany({});
    await prisma.AuthToken.deleteMany({});
    await prisma.OTP.deleteMany({});
    await prisma.CaregiverSpeaker.deleteMany({});
    await prisma.Image.deleteMany({});

    // Luego borrar tablas principales
    await prisma.Pictogram.deleteMany({});
    await prisma.Grid.deleteMany({});
    await prisma.UserAuth.deleteMany({});
    await prisma.User.deleteMany({});
    await prisma.Role.deleteMany({});
    await prisma.PartOfSpeech.deleteMany({});

    console.log("Todas las tablas han sido vaciadas correctamente.");

    // Opcional: Reiniciar secuencias de PostgreSQL
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Grid_id_seq" RESTART WITH 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Pictogram_id_seq" RESTART WITH 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Role_id_seq" RESTART WITH 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "GridPictogram_id_seq" RESTART WITH 1;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Image_id_seq" RESTART WITH 1;`
    );

    console.log("🔄 Secuencias reiniciadas correctamente.");
  } catch (err) {
    console.error("❌ Error limpiando la base de datos:", err);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
