import * as sentenceRepo from "../repositories/sentence.repository.js";
import prisma from "../lib/prisma.js";

export const createSentenceService = async (
  userId,
  pictograms,
  options = {}
) => {
  if (!pictograms || pictograms.length === 0) {
    throw new Error("Debe enviar al menos un pictograma");
  }

  const pictogramRecords = await prisma.pictogram.findMany({
    where: { id: { in: pictograms } },
  });

  if (pictogramRecords.length !== pictograms.length) {
    throw new Error("Uno o más pictogramas no existen");
  }

  const telegraphicText = pictogramRecords.map((p) => p.name).join(" ");

  const sentence = await sentenceRepo.createSentence(prisma, {
    userId,
    telegraphicText,
    naturalText: "",
    meta: { pictograms, ...options },
  });

  await Promise.all(
    pictograms.map(async (pictogramId) => {
      await prisma.userPictogramUsage.upsert({
        where: {
          userId_pictogramId: {
            userId,
            pictogramId,
          },
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
        create: {
          userId,
          pictogramId,
          usageCount: 1,
        },
      });

      await prisma.pictogram.update({
        where: { id: pictogramId },
        data: { usageFrequency: { increment: 1 } },
      });
    })
  );

  return sentence;
};
