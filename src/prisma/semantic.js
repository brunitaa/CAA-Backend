import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding semantic categories...");

  const categories = [
    {
      name: "Acciones",
      description: "Verbos o acciones que se pueden realizar",
    },
    { name: "Objetos", description: "Objetos físicos o cosas" },
    { name: "Animales", description: "Seres vivos no humanos" },
    { name: "Alimentos", description: "Comida y bebida" },
    { name: "Emociones", description: "Sentimientos o estados de ánimo" },
    { name: "Lugares", description: "Ubicaciones o sitios" },
    { name: "Personas", description: "Seres humanos" },
    { name: "Colores", description: "Diferentes colores" },
    { name: "Tiempo", description: "Conceptos relacionados con el tiempo" },
    { name: "Preposiciones", description: "Palabras de enlace o relación" },
  ];

  for (const category of categories) {
    await prisma.semanticCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("Semantic categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
