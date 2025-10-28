-- AlterTable
ALTER TABLE "public"."Pictogram" ADD COLUMN     "originalId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Pictogram" ADD CONSTRAINT "Pictogram_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "public"."Pictogram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
