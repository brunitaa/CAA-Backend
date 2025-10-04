-- DropForeignKey
ALTER TABLE "public"."Grid" DROP CONSTRAINT "Grid_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Grid" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Grid" ADD CONSTRAINT "Grid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
