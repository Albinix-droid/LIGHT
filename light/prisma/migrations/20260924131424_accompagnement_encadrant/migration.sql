-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StepStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "StepStatus" ADD VALUE 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "supervisorId" TEXT;

-- CreateTable
CREATE TABLE "StepSubmission" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT,
    "data" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" "ReviewDecision",
    "feedback" TEXT,
    "rating" INTEGER,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "StepSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StepSubmission_stepId_submittedAt_idx" ON "StepSubmission"("stepId", "submittedAt");

-- CreateIndex
CREATE INDEX "StepSubmission_reviewerId_idx" ON "StepSubmission"("reviewerId");

-- CreateIndex
CREATE INDEX "Project_supervisorId_idx" ON "Project"("supervisorId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepSubmission" ADD CONSTRAINT "StepSubmission_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProjectStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepSubmission" ADD CONSTRAINT "StepSubmission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepSubmission" ADD CONSTRAINT "StepSubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
