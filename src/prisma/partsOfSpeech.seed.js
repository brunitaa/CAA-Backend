// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Limpia la tabla si lo necesitas
  // await prisma.partOfSpeech.deleteMany();

  await prisma.partOfSpeech.createMany({
    data: [
      {
        code: "noun",
        name: "Sustantivo",
        description: "Personas, lugares, cosas, objetos",
        color: "#FFFF00", // Amarillo
      },
      {
        code: "verb",
        name: "Verbo",
        description: "Acciones o estados",
        color: "#00FF00", // Verde
      },
      {
        code: "adjective",
        name: "Adjetivo",
        description: "Describe o califica a un sustantivo",
        color: "#1E90FF", // Azul
      },
      {
        code: "adverb",
        name: "Adverbio",
        description: "Modifica a un verbo, adjetivo u otro adverbio",
        color: "#FFA500", // Naranja
      },
      {
        code: "pronoun",
        name: "Pronombre",
        description: "Sustituye a un sustantivo",
        color: "#FFC0CB", // Rosa
      },
      {
        code: "article",
        name: "Artículo/Determinante",
        description: "el, la, los, las, un, una…",
        color: "#F5F5F5", // Blanco/Gris claro
      },
      {
        code: "preposition",
        name: "Preposición",
        description: "a, de, en, por…",
        color: "#800080", // Morado
      },
      {
        code: "conjunction",
        name: "Conjunción",
        description: "y, o, pero…",
        color: "#800080", // Morado (mismo que preposición en este estándar)
      },
      {
        code: "interjection",
        name: "Interjección/Misceláneo",
        description: "¡hola!, ¡ay!, ¡wow!",
        color: "#A52A2A", // Marrón
      },
    ],
  });

  console.log("✅ Seed de PartOfSpeech completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
