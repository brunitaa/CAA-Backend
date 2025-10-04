// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // =========================
  // PartOfSpeech (ya lo tienes)
  // =========================
  await prisma.partOfSpeech.createMany({
    data: [
      {
        code: "noun",
        name: "Sustantivo",
        description: "Personas, lugares, cosas, objetos",
        color: "#FFFF00",
      },
      {
        code: "verb",
        name: "Verbo",
        description: "Acciones o estados",
        color: "#00FF00",
      },
      {
        code: "adjective",
        name: "Adjetivo",
        description: "Describe o califica a un sustantivo",
        color: "#1E90FF",
      },
      {
        code: "adverb",
        name: "Adverbio",
        description: "Modifica a un verbo, adjetivo u otro adverbio",
        color: "#FFA500",
      },
      {
        code: "pronoun",
        name: "Pronombre",
        description: "Sustituye a un sustantivo",
        color: "#FFC0CB",
      },
      {
        code: "article",
        name: "Artículo/Determinante",
        description: "el, la, los, las, un, una…",
        color: "#F5F5F5",
      },
      {
        code: "preposition",
        name: "Preposición",
        description: "a, de, en, por…",
        color: "#800080",
      },
      {
        code: "conjunction",
        name: "Conjunción",
        description: "y, o, pero…",
        color: "#800080",
      },
      {
        code: "interjection",
        name: "Interjección/Misceláneo",
        description: "¡hola!, ¡ay!, ¡wow!",
        color: "#A52A2A",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed de PartOfSpeech completado.");

  // =========================
  // SemanticCategory
  // =========================
  console.log("Seed de SemanticCategory...");

  // Categorías raíz
  const acciones = await prisma.semanticCategory.upsert({
    where: { name: "Acciones" },
    update: {},
    create: {
      name: "Acciones",
      description: "Verbos o acciones que se pueden realizar",
    },
  });

  const objetos = await prisma.semanticCategory.upsert({
    where: { name: "Objetos" },
    update: {},
    create: { name: "Objetos", description: "Cosas u objetos físicos" },
  });

  const animales = await prisma.semanticCategory.upsert({
    where: { name: "Animales" },
    update: {},
    create: { name: "Animales", description: "Seres vivos no humanos" },
  });

  const alimentos = await prisma.semanticCategory.upsert({
    where: { name: "Alimentos" },
    update: {},
    create: { name: "Alimentos", description: "Comida y bebida" },
  });

  const emociones = await prisma.semanticCategory.upsert({
    where: { name: "Emociones" },
    update: {},
    create: {
      name: "Emociones",
      description: "Sentimientos o estados de ánimo",
    },
  });

  const lugares = await prisma.semanticCategory.upsert({
    where: { name: "Lugares" },
    update: {},
    create: { name: "Lugares", description: "Ubicaciones o sitios" },
  });

  // Subcategorías de Acciones
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Movimiento",
        description: "Acciones de movimiento",
        parentId: acciones.id,
      },
      {
        name: "Pensamiento",
        description: "Acciones mentales",
        parentId: acciones.id,
      },
      {
        name: "Comunicación",
        description: "Acciones relacionadas con hablar o gestos",
        parentId: acciones.id,
      },
    ],
    skipDuplicates: true,
  });

  // Subcategorías de Objetos
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Herramientas",
        description: "Objetos utilizados para trabajar",
        parentId: objetos.id,
      },
      { name: "Ropa", description: "Prendas de vestir", parentId: objetos.id },
      {
        name: "Muebles",
        description: "Objetos de mobiliario",
        parentId: objetos.id,
      },
    ],
    skipDuplicates: true,
  });

  // Subcategorías de Animales
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Mascotas",
        description: "Animales domésticos",
        parentId: animales.id,
      },
      {
        name: "Animales salvajes",
        description: "Animales que viven en la naturaleza",
        parentId: animales.id,
      },
    ],
    skipDuplicates: true,
  });

  // Subcategorías de Alimentos
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Frutas",
        description: "Frutas comestibles",
        parentId: alimentos.id,
      },
      {
        name: "Verduras",
        description: "Vegetales comestibles",
        parentId: alimentos.id,
      },
      {
        name: "Bebidas",
        description: "Líquidos para beber",
        parentId: alimentos.id,
      },
    ],
    skipDuplicates: true,
  });

  // Subcategorías de Emociones
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Positivas",
        description: "Emociones agradables o felices",
        parentId: emociones.id,
      },
      {
        name: "Negativas",
        description: "Emociones desagradables o tristes",
        parentId: emociones.id,
      },
    ],
    skipDuplicates: true,
  });

  // Subcategorías de Lugares
  await prisma.semanticCategory.createMany({
    data: [
      {
        name: "Interior",
        description: "Lugares dentro de edificios",
        parentId: lugares.id,
      },
      {
        name: "Exterior",
        description: "Lugares al aire libre",
        parentId: lugares.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed de SemanticCategory completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
