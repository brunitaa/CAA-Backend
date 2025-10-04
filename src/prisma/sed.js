// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed para producción...");

  // =========================
  // PartOfSpeech
  // =========================
  const posData = [
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
  ];
  await prisma.partOfSpeech.createMany({ data: posData, skipDuplicates: true });
  console.log("POS creado.");

  // =========================
  // SemanticCategory (padre-hijo)
  // =========================
  const categories = [
    {
      name: "Acciones",
      description: "Verbos o acciones que se pueden realizar",
    },
    { name: "Objetos", description: "Cosas u objetos físicos" },
    { name: "Personas", description: "Individuos o grupos" },
    { name: "Lugares", description: "Localizaciones físicas o geográficas" },
    { name: "Emociones", description: "Estados emocionales o sentimientos" },
  ];

  const createdCategories = [];
  for (const c of categories) {
    const cat = await prisma.semanticCategory.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    createdCategories.push(cat);
  }

  // Subcategorías ejemplo
  const subCategoriesData = [
    {
      name: "Movimiento",
      description: "Acciones de movimiento",
      parentName: "Acciones",
    },
    {
      name: "Comunicación",
      description: "Acciones de comunicación",
      parentName: "Acciones",
    },
    {
      name: "Herramientas",
      description: "Objetos usados para trabajar",
      parentName: "Objetos",
    },
    { name: "Ropa", description: "Prendas de vestir", parentName: "Objetos" },
    {
      name: "Familia",
      description: "Miembros de la familia",
      parentName: "Personas",
    },
    {
      name: "Escuela",
      description: "Lugares educativos",
      parentName: "Lugares",
    },
    {
      name: "Naturaleza",
      description: "Entornos naturales",
      parentName: "Lugares",
    },
    {
      name: "Felicidad",
      description: "Emociones positivas",
      parentName: "Emociones",
    },
    {
      name: "Tristeza",
      description: "Emociones negativas",
      parentName: "Emociones",
    },
  ];

  const subCategories = [];
  for (const sc of subCategoriesData) {
    const parent = await prisma.semanticCategory.findUnique({
      where: { name: sc.parentName },
    });
    if (parent) {
      const subCat = await prisma.semanticCategory.upsert({
        where: { name: sc.name },
        update: {},
        create: {
          name: sc.name,
          description: sc.description,
          parentId: parent.id,
        },
      });
      subCategories.push(subCat);
    }
  }
  console.log("Semantic Categories creadas.");

  // =========================
  // Imágenes de ejemplo
  // =========================
  const imageUrls = [
    "/images/run.png",
    "/images/jump.png",
    "/images/talk.png",
    "/images/hammer.png",
    "/images/shirt.png",
    "/images/mom.png",
    "/images/school.png",
    "/images/forest.png",
    "/images/happy.png",
    "/images/sad.png",
  ];

  const images = [];
  for (const url of imageUrls) {
    const img = await prisma.image.create({
      data: { url, userId: 1 },
    });
    images.push(img);
  }
  console.log("Imágenes creadas.");

  // =========================
  // Pictograms
  // =========================
  const pictogramsData = [
    {
      name: "Correr",
      imageIndex: 0,
      posCode: "verb",
      categoryName: "Movimiento",
    },
    {
      name: "Saltar",
      imageIndex: 1,
      posCode: "verb",
      categoryName: "Movimiento",
    },
    {
      name: "Hablar",
      imageIndex: 2,
      posCode: "verb",
      categoryName: "Comunicación",
    },
    {
      name: "Martillo",
      imageIndex: 3,
      posCode: "noun",
      categoryName: "Herramientas",
    },
    { name: "Camisa", imageIndex: 4, posCode: "noun", categoryName: "Ropa" },
    { name: "Mamá", imageIndex: 5, posCode: "noun", categoryName: "Familia" },
    {
      name: "Escuela",
      imageIndex: 6,
      posCode: "noun",
      categoryName: "Escuela",
    },
    {
      name: "Bosque",
      imageIndex: 7,
      posCode: "noun",
      categoryName: "Naturaleza",
    },
    {
      name: "Feliz",
      imageIndex: 8,
      posCode: "adjective",
      categoryName: "Felicidad",
    },
    {
      name: "Triste",
      imageIndex: 9,
      posCode: "adjective",
      categoryName: "Tristeza",
    },
  ];

  for (const pd of pictogramsData) {
    const pict = await prisma.pictogram.create({
      data: {
        name: pd.name,
        imageId: images[pd.imageIndex].id,
        userId: 1,
        createdBy: 1,
        isActive: true,
      },
    });

    const pos = await prisma.partOfSpeech.findUnique({
      where: { code: pd.posCode },
    });
    if (pos) {
      await prisma.pictogramPos.create({
        data: { pictogramId: pict.id, posId: pos.id, isPrimary: true },
      });
    }

    const category = await prisma.semanticCategory.findUnique({
      where: { name: pd.categoryName },
    });
    if (category) {
      await prisma.pictogramSemantic.create({
        data: { pictogramId: pict.id, categoryId: category.id },
      });
    }
  }

  console.log("Pictograms y relaciones POS/Semantic creados.");

  // =========================
  // Grid inicial
  // =========================
  const grid = await prisma.grid.create({
    data: {
      userId: 1,
      name: "Grid de ejemplo",
      description: "Grid inicial de prueba",
      isActive: true,
    },
  });

  // Asignar algunos pictogramas al grid
  const allPictograms = await prisma.pictogram.findMany();
  for (let i = 0; i < allPictograms.length; i++) {
    await prisma.gridPictogram.create({
      data: { gridId: grid.id, pictogramId: allPictograms[i].id, position: i },
    });
  }

  console.log("Grid inicial y asignación de pictogramas completados.");
  console.log("Seed de producción finalizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
