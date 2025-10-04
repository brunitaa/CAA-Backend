-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('female', 'male', 'other');

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "gender" "public"."Gender",
    "age" INTEGER,
    "roleId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAuth" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaregiverSpeaker" (
    "id" SERIAL NOT NULL,
    "caregiverId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaregiverSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "filesize" INTEGER,
    "height" INTEGER,
    "width" INTEGER,
    "mimeType" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grid" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GridPictogram" (
    "id" SERIAL NOT NULL,
    "gridId" INTEGER NOT NULL,
    "pictogramId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GridPictogram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartOfSpeech" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pictogram" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" INTEGER,
    "userId" INTEGER,
    "lemma" TEXT,
    "createdBy" INTEGER NOT NULL,
    "usageFrequency" BIGINT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "isMultiword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Pictogram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PictogramPos" (
    "id" SERIAL NOT NULL,
    "pictogramId" INTEGER NOT NULL,
    "posId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PictogramPos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SemanticCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,

    CONSTRAINT "SemanticCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PictogramSemantic" (
    "pictogramId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "PictogramSemantic_pkey" PRIMARY KEY ("pictogramId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."Sentence" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "telegraphicText" TEXT NOT NULL,
    "naturalText" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "deviceInfo" TEXT,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserStatistics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalSentences" INTEGER NOT NULL DEFAULT 0,
    "totalPictogramsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3),
    "favoritePictogramId" INTEGER,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceToken" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MLTrainingData" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sequence" JSONB NOT NULL,
    "nextPictogramId" INTEGER,
    "context" JSONB,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLTrainingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MLPrediction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "predictedPictogramId" INTEGER NOT NULL,
    "actualPictogramId" INTEGER,
    "context" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "meta" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OTP" (
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_key" ON "public"."UserAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "public"."UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverSpeaker_caregiverId_speakerId_key" ON "public"."CaregiverSpeaker"("caregiverId", "speakerId");

-- CreateIndex
CREATE UNIQUE INDEX "GridPictogram_gridId_pictogramId_key" ON "public"."GridPictogram"("gridId", "pictogramId");

-- CreateIndex
CREATE UNIQUE INDEX "GridPictogram_gridId_position_key" ON "public"."GridPictogram"("gridId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_code_key" ON "public"."PartOfSpeech"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PictogramPos_pictogramId_posId_key" ON "public"."PictogramPos"("pictogramId", "posId");

-- CreateIndex
CREATE UNIQUE INDEX "SemanticCategory_name_key" ON "public"."SemanticCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistics_userId_key" ON "public"."UserStatistics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistics_favoritePictogramId_key" ON "public"."UserStatistics"("favoritePictogramId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceToken_key" ON "public"."Device"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "public"."AuthToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaregiverSpeaker" ADD CONSTRAINT "CaregiverSpeaker_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaregiverSpeaker" ADD CONSTRAINT "CaregiverSpeaker_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grid" ADD CONSTRAINT "Grid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GridPictogram" ADD CONSTRAINT "GridPictogram_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "public"."Grid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GridPictogram" ADD CONSTRAINT "GridPictogram_pictogramId_fkey" FOREIGN KEY ("pictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pictogram" ADD CONSTRAINT "Pictogram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pictogram" ADD CONSTRAINT "Pictogram_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pictogram" ADD CONSTRAINT "Pictogram_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PictogramPos" ADD CONSTRAINT "PictogramPos_pictogramId_fkey" FOREIGN KEY ("pictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PictogramPos" ADD CONSTRAINT "PictogramPos_posId_fkey" FOREIGN KEY ("posId") REFERENCES "public"."PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SemanticCategory" ADD CONSTRAINT "SemanticCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."SemanticCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PictogramSemantic" ADD CONSTRAINT "PictogramSemantic_pictogramId_fkey" FOREIGN KEY ("pictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PictogramSemantic" ADD CONSTRAINT "PictogramSemantic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."SemanticCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sentence" ADD CONSTRAINT "Sentence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserStatistics" ADD CONSTRAINT "UserStatistics_favoritePictogramId_fkey" FOREIGN KEY ("favoritePictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLTrainingData" ADD CONSTRAINT "MLTrainingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLTrainingData" ADD CONSTRAINT "MLTrainingData_nextPictogramId_fkey" FOREIGN KEY ("nextPictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLPrediction" ADD CONSTRAINT "MLPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLPrediction" ADD CONSTRAINT "MLPrediction_predictedPictogramId_fkey" FOREIGN KEY ("predictedPictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLPrediction" ADD CONSTRAINT "MLPrediction_actualPictogramId_fkey" FOREIGN KEY ("actualPictogramId") REFERENCES "public"."Pictogram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
