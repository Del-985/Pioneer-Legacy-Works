ALTER TABLE "Quote" ADD COLUMN "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0;

CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");
CREATE INDEX "Job_customerId_createdAt_idx" ON "Job"("customerId", "createdAt");
CREATE INDEX "Job_quoteId_idx" ON "Job"("quoteId");
CREATE INDEX "Job_serviceRequestId_idx" ON "Job"("serviceRequestId");
