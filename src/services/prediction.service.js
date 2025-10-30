import prisma from "../lib/prisma.js";
import axios from "axios";

export async function predictPictograms(text, speakerId) {
  try {
    console.log({
      text,
      speaker_id: Number(speakerId),
    });

    // Llamada al modelo FastAPI
    const response = await axios.post("http://localhost:8000/predict", {
      text,
      speaker_id: Number(speakerId),
    });

    const predictedIds = response.data.predictions || [];
    if (!predictedIds.length) {
      console.warn("No se predijeron pictogramas para:", text);
      return [];
    }

    const now = new Date();

    // Guardar predicciones
    const createPredictions = predictedIds.map((pictogramId) => ({
      userId: Number(speakerId),
      predictedPictogramId: Number(pictogramId), // ✅ convertir a número
      context: { text },
      createdAt: now,
    }));
    await prisma.mLPrediction.createMany({ data: createPredictions });

    // Actualizar uso de pictogramas
    await Promise.all(
      predictedIds.map((pictogramId) =>
        prisma.userPictogramUsage.upsert({
          where: {
            userId_pictogramId: {
              userId: Number(speakerId),
              pictogramId: Number(pictogramId), // ✅ convertir a número
            },
          },
          update: { usageCount: { increment: 1 }, lastUsedAt: now },
          create: {
            userId: Number(speakerId),
            pictogramId: Number(pictogramId), // ✅ convertir a número
            usageCount: 1,
            lastUsedAt: now,
          },
        })
      )
    );

    return predictedIds.map(Number); // opcional: aseguramos que sean números
  } catch (error) {
    if (error.response) {
      console.error(
        "Error FastAPI:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Error Axios:", error.message);
    }
    return [];
  }
}
