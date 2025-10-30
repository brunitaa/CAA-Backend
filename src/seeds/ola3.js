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
  console.log("🧹 Creando pictogramas adicionales...");

  // Imagen genérica fallback
  const baseImage = await prisma.image.findFirst({
    where: { url: "/images/default.png" },
  });
  if (!baseImage) throw new Error("No existe imagen base /images/default.png");

  const palabrasPorCategoria = {
    cocina: [
      "agua",
      "leche",
      "jugo",
      "pan",
      "galleta",
      "fruta",
      "pollo",
      "arroz",
      "sopa",
      "cuchara",
      "tenedor",
      "plato",
      "taza",
      "olla",
      "sartén",
    ],
    baño: [
      "baño",
      "lavabo",
      "ducha",
      "toalla",
      "jabón",
      "cepillo de dientes",
      "pasta dental",
      "espejo",
    ],
    juguetes: [
      "pelota",
      "muñeca",
      "lego",
      "camión",
      "puzzle",
      "carrito",
      "títere",
      "rompecabezas",
    ],
    vestimenta: [
      "camisa",
      "pantalón",
      "zapatos",
      "sombrero",
      "bufanda",
      "chaqueta",
      "calcetines",
      "vestido",
    ],
    accesorios: ["mochila", "bolso", "reloj", "gafas", "collar", "anillo"],
    lugares: [
      "casa",
      "escuela",
      "parque",
      "tienda",
      "hospital",
      "biblioteca",
      "cocina",
      "baño",
      "plaza",
    ],
  };

  const categorias = {
    Sujeto: "subject",
    Verbo: "verb",
    Sustantivo: "noun",
    Adjetivo: "adjective",
  };

  function obtenerCategoria(palabra) {
    // Verbos simples (para este seed no tenemos muchos)
    const verbos = [];
    const emociones = [];
    const sujetos = ["yo", "tú", "él", "ella", "nosotros"];
    if (verbos.includes(palabra)) return "Verbo";
    if (emociones.includes(palabra)) return "Adjetivo";
    if (sujetos.includes(palabra)) return "Sujeto";
    return "Sustantivo"; // todo lo demás
  }

  for (const [grupo, palabras] of Object.entries(palabrasPorCategoria)) {
    for (const palabra of palabras) {
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
            const localUrl = await downloadImage(urlImagen, `${pictId}.png`);
            const img = await prisma.image.create({
              data: { url: localUrl, userId: 1 },
            });
            imageId = img.id;
          }
        }
      } catch (err) {
        console.warn(`⚠️ Error con "${palabra}", usando imagen genérica.`);
      }

      // Crear pictograma
      const pict = await prisma.pictogram.create({
        data: {
          name: palabra,
          imageId,
          userId: null,
          createdBy: 1,
          isActive: true,
        },
      });

      // Asociar POS según categoría
      const categoria = obtenerCategoria(palabra);
      const pos = await prisma.partOfSpeech.findUnique({
        where: { code: categorias[categoria] },
      });
      if (pos) {
        await prisma.pictogramPos.create({
          data: { pictogramId: pict.id, posId: pos.id, isPrimary: true },
        });
      }

      console.log(`✅ Pictograma creado: "${palabra}" → POS: ${categoria}`);
    }
  }

  console.log("🎉 Seed de pictogramas adicionales completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
