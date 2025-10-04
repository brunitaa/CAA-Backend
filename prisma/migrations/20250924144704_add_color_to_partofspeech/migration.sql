/*
  Warnings:

  - Added the required column `color` to the `PartOfSpeech` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PartOfSpeech" ADD COLUMN     "color" TEXT NOT NULL;
