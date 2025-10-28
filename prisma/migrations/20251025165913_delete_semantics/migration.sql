/*
  Warnings:

  - You are about to drop the `PictogramSemantic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SemanticCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PictogramSemantic" DROP CONSTRAINT "PictogramSemantic_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PictogramSemantic" DROP CONSTRAINT "PictogramSemantic_pictogramId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SemanticCategory" DROP CONSTRAINT "SemanticCategory_parentId_fkey";

-- DropTable
DROP TABLE "public"."PictogramSemantic";

-- DropTable
DROP TABLE "public"."SemanticCategory";
