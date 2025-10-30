import * as sentenceRepo from "../repositories/sentence.repository.js";
import prisma from "../lib/prisma.js";

export const createSentenceService = async (
  userId,
  pictograms,
  options = {}
) => {
  console.log("pictograms");
  console.log(pictograms);
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

export const getAllSentencesService = async () => {
  const sentences = await prisma.sentence.findMany();

  const formatted = sentences.map((s) => {
    // s.meta ya es un objeto porque es JSONB
    const pictogramIds = s.meta?.pictograms?.map(String) || [];

    return {
      input_text: s.telegraphicText,
      pictogram_ids: pictogramIds,
      speaker_id: `speaker${s.userId}`,
    };
  });

  return formatted;
};

export const saveMLSuggestionService = async ({
  input_text,
  suggested_ids,
  speaker_id,
  timestamp,
}) => {
  const ts = timestamp || new Date().toISOString();
  const userId = speaker_id;

  const sentence = await prisma.sentence.create({
    data: {
      userId,
      telegraphicText: input_text,
      meta: {
        mlSuggestions: {
          suggested_ids,
          timestamp: timestamp || new Date().toISOString(),
        },
      },
    },
  });

  return sentence;
};

export const saveUserSelectionService = async ({
  input_text,
  used_ids,
  speaker_id,
  timestamp,
}) => {
  const userId = speaker_id;
  const sentence = await prisma.sentence.findFirst({
    where: { userId, telegraphicText: input_text },
    orderBy: { createdAt: "desc" },
  });

  if (!sentence) throw new Error("Oración no encontrada");

  const updated = await prisma.sentence.update({
    where: { id: sentence.id },
    data: {
      meta: { used_ids, timestamp },
    },
  });

  return updated;
};
