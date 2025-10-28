import prisma from "../lib/prisma.js";

export const createSentence = async (prismaClient, sentenceData) => {
  return prismaClient.sentence.create({
    data: {
      userId: sentenceData.userId,
      telegraphicText: sentenceData.telegraphicText,
      naturalText: sentenceData.naturalText,
      meta: sentenceData.meta,
    },
  });
};
