-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('PROJECT_INVITATION', 'JOIN_REQUEST', 'SUPERVISION_REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ProjectRequest" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "role" "ProjectRole",
    "message" TEXT,
    "responseMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectRequest_recipientId_status_idx" ON "ProjectRequest"("recipientId", "status");

-- CreateIndex
CREATE INDEX "ProjectRequest_senderId_status_idx" ON "ProjectRequest"("senderId", "status");

-- CreateIndex
CREATE INDEX "ProjectRequest_projectId_type_status_idx" ON "ProjectRequest"("projectId", "type", "status");

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

