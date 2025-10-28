-- CreateTable
CREATE TABLE "UserPictogramUsage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pictogramId" INTEGER NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPictogramUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPictogramUsage_userId_pictogramId_key" ON "UserPictogramUsage"("userId", "pictogramId");

-- AddForeignKey
ALTER TABLE "UserPictogramUsage" ADD CONSTRAINT "UserPictogramUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPictogramUsage" ADD CONSTRAINT "UserPictogramUsage_pictogramId_fkey" FOREIGN KEY ("pictogramId") REFERENCES "Pictogram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
