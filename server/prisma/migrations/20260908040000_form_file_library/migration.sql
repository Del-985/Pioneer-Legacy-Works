-- CreateTable
CREATE TABLE "FormFile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "businessScope" TEXT NOT NULL DEFAULT 'all',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormFile_category_businessScope_createdAt_idx" ON "FormFile"("category", "businessScope", "createdAt");

-- AddForeignKey
ALTER TABLE "FormFile" ADD CONSTRAINT "FormFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
