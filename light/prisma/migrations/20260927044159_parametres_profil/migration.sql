-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "notificationPrefs" JSONB,
ADD COLUMN     "track" "ChannelTrack";

