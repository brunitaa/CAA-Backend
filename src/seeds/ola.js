import prisma from "../lib/prisma.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

async function downloadImage(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error descargando imagen: ${url}`);
    const buffer = await res.arrayBuffer();
    const dir = path.resolve("uploads/images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return `/uploads/images/${filename}`;
  } catch (err) {
    console.warn(`⚠️ No se pudo descargar ${url}: ${err.message}`);
    return "/images/default.png"; // fallback
  }
}

async function main() {
  console.log("🧹 Limpiando base de datos...");
  await prisma.pictogramPos.deleteMany({});
  await prisma.gridPictogram.deleteMany({});
  await prisma.mLPrediction.deleteMany({});
  await prisma.mLTrainingData.deleteMany({});
  await prisma.pictogram.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.partOfSpeech.deleteMany({});
  await prisma.grid.deleteMany({});
  console.log("✅ Datos antiguos eliminados.");

  // === POS ===
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
      code: "subject",
      name: "Sujeto",
      description: "Pronombres y sujetos",
      color: "#FFC0CB",
    },
    {
      code: "adverb",
      name: "Adverbio",
      description: "Modifica un verbo, adjetivo u otro adverbio",
      color: "#FFA500",
    },
    {
      code: "preposition",
      name: "Preposición",
      description: "Relaciones de posición, dirección o tiempo",
      color: "#800080",
    },
    {
      code: "conjunction",
      name: "Conjunción",
      description: "Une palabras, frases u oraciones",
      color: "#00CED1",
    },
    {
      code: "interjection",
      name: "Interjección",
      description: "Expresiones de emoción o reacción",
      color: "#FF1493",
    },
    {
      code: "pronoun",
      name: "Pronombre",
      description: "Sustituye a un sustantivo",
      color: "#8B0000",
    },
    {
      code: "determiner",
      name: "Determinante",
      description: "Acompaña a un sustantivo para especificarlo",
      color: "#228B22",
    },
  ];
  await prisma.partOfSpeech.createMany({ data: posData });
  console.log("✅ Todos los POS creados.");

  // === Imagen genérica fallback ===
  const baseImage = await prisma.image.create({
    data: { url: "/images/default.png", userId: 1 },
  });

  // === Diccionario base ===
  const sujetos = [
    "yo",
    "tú",
    "él",
    "ella",
    "nosotros",
    "nosotras",
    "ellos",
    "ellas",
    "mi mamá",
    "mi papá",
    "mi amigo",
    "mi profesora",
    "mi hermano",
    "mi perro",
  ];
  const verbos = [
    "quiero",
    "no quiero",
    "voy",
    "voy a",
    "me gusta",
    "necesito",
    "tengo",
    "veo",
    "escucho",
    "siento",
    "pienso",
    "digo",
    "como",
    "bebo",
    "uso",
    "juego",
    "corro",
    "duermo",
    "leo",
    "pinto",
    "ayudo",
    "camino",
    "salto",
    "trabajo",
    "estudio",
    "aprendo",
  ];
  const objetos = [
    "agua",
    "comida",
    "leche",
    "jugo",
    "pan",
    "galleta",
    "fruta",
    "pollo",
    "arroz",
    "sopa",
    "pelota",
    "muñeca",
    "libro",
    "televisión",
    "teléfono",
    "computadora",
    "ropa",
    "auto",
    "bicicleta",
    "flor",
    "peluche",
    "película",
    "música",
    "juego",
    "baño",
    "cama",
    "silla",
    "mesa",
    "ventana",
    "puerta",
    "reloj",
    "zapatos",
    "caramelo",
    "chocolate",
    "helado",
  ];
  const lugares = [
    "escuela",
    "casa",
    "parque",
    "tienda",
    "hospital",
    "iglesia",
    "calle",
    "jardín",
    "cocina",
    "baño",
    "comedor",
    "habitación",
    "biblioteca",
    "cine",
    "playa",
    "plaza",
  ];
  const emociones = [
    "feliz",
    "triste",
    "enojado",
    "asustado",
    "cansado",
    "emocionado",
    "aburrido",
    "tranquilo",
  ];
  const animales = [
    "perro",
    "gato",
    "pájaro",
    "pez",
    "conejo",
    "vaca",
    "caballo",
    "pollo",
    "tigre",
    "león",
  ];

  const todasLasPalabras = [
    ...sujetos,
    ...verbos,
    ...objetos,
    ...lugares,
    ...emociones,
    ...animales,
  ];

  const categorias = {
    Sujeto: "subject",
    Verbo: "verb",
    Sustantivo: "noun",
    Adjetivo: "adjective",
  };
  function obtenerCategoria(palabra) {
    if (sujetos.includes(palabra)) return "Sujeto";
    if (verbos.includes(palabra)) return "Verbo";
    if (emociones.includes(palabra)) return "Adjetivo";
    if ([...objetos, ...lugares, ...animales].includes(palabra))
      return "Sustantivo";
    return "Sustantivo";
  }

  console.log(
    `🧩 Creando ${todasLasPalabras.length} pictogramas con imágenes de ARASAAC...`
  );

  for (const palabra of todasLasPalabras) {
    let imageId = baseImage.id;

    try {
      // Buscar palabra en ARASAAC
      const searchRes = await fetch(
        `https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(
          palabra
        )}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.length > 0) {
          const pictId = searchData[0]._id;
          const urlImagen = `https://api.arasaac.org/api/pictograms/${pictId}`;

          // Descargar imagen a uploads/images
          const localUrl = await downloadImage(urlImagen, `${pictId}.png`);
          console.log(
            `🔎 Palabra: "${palabra}" → ARASAAC ID: ${pictId} → Local URL: ${localUrl}`
          );

          const img = await prisma.image.create({
            data: { url: localUrl, userId: 1 },
          });
          imageId = img.id;
        } else {
          console.warn(
            `⚠️ No se encontró pictograma para "${palabra}", usando imagen genérica.`
          );
        }
      } else {
        console.warn(
          `⚠️ Error buscando "${palabra}" en ARASAAC, usando imagen genérica.`
        );
      }
    } catch (err) {
      console.warn(
        `⚠️ Error con "${palabra}", usando imagen genérica: ${err.message}`
      );
    }

    const categoria = obtenerCategoria(palabra);
    const posCode = categorias[categoria];

    const pict = await prisma.pictogram.create({
      data: {
        name: palabra,
        imageId,
        userId: null,
        createdBy: 1,
        isActive: true,
      },
    });

    const pos = await prisma.partOfSpeech.findUnique({
      where: { code: posCode },
    });
    if (pos) {
      await prisma.pictogramPos.create({
        data: { pictogramId: pict.id, posId: pos.id, isPrimary: true },
      });
    }
  }

  console.log("✅ Todos los pictogramas creados.");

  // === Grid inicial ===
  const grid = await prisma.grid.create({
    data: {
      userId: 1,
      name: "Diccionario Base CAA",
      description: "Grid inicial con pictogramas base y sus POS",
      isActive: true,
    },
  });

  const allPictograms = await prisma.pictogram.findMany();
  for (let i = 0; i < allPictograms.length; i++) {
    await prisma.gridPictogram.create({
      data: { gridId: grid.id, pictogramId: allPictograms[i].id, position: i },
    });
  }

  console.log("✅ Grid inicial creado. Base lista para CAA.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
