-- AlterTable
ALTER TABLE "public"."MLPrediction" ADD COLUMN     "modelId" INTEGER;

-- AlterTable
ALTER TABLE "public"."MLTrainingData" ADD COLUMN     "isValidated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modelId" INTEGER,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedBy" INTEGER;

-- CreateTable
CREATE TABLE "public"."MLModelMetadata" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "framework" TEXT NOT NULL DEFAULT 'PyTorch',
    "architecture" TEXT NOT NULL DEFAULT 'MiniBERT',
    "hyperparams" JSONB,
    "metrics" JSONB,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainedBy" INTEGER,
    "storagePath" TEXT,
    "isDeployed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "MLModelMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MLModelMetadata_version_key" ON "public"."MLModelMetadata"("version");

-- CreateIndex
CREATE INDEX "MLPrediction_userId_createdAt_idx" ON "public"."MLPrediction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MLPrediction_modelId_idx" ON "public"."MLPrediction"("modelId");

-- CreateIndex
CREATE INDEX "MLTrainingData_userId_createdAt_idx" ON "public"."MLTrainingData"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MLTrainingData_modelId_idx" ON "public"."MLTrainingData"("modelId");

-- AddForeignKey
ALTER TABLE "public"."MLModelMetadata" ADD CONSTRAINT "MLModelMetadata_trainedBy_fkey" FOREIGN KEY ("trainedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLTrainingData" ADD CONSTRAINT "MLTrainingData_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."MLModelMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLTrainingData" ADD CONSTRAINT "MLTrainingData_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MLPrediction" ADD CONSTRAINT "MLPrediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."MLModelMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
