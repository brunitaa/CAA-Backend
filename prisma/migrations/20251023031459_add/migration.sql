-- AlterTable
ALTER TABLE "public"."Grid" ADD COLUMN     "createdBy" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Grid" ADD CONSTRAINT "Grid_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
