-- CreateTable
CREATE TABLE "SpeakerSettings" (
    "id" SERIAL NOT NULL,
    "speakerId" INTEGER NOT NULL,
    "caregiverId" INTEGER NOT NULL,
    "mlEnabled" BOOLEAN NOT NULL DEFAULT true,
    "canEditPictograms" BOOLEAN NOT NULL DEFAULT true,
    "canEditGrids" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SpeakerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpeakerSettings_speakerId_caregiverId_key" ON "SpeakerSettings"("speakerId", "caregiverId");

-- AddForeignKey
ALTER TABLE "SpeakerSettings" ADD CONSTRAINT "SpeakerSettings_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakerSettings" ADD CONSTRAINT "SpeakerSettings_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
