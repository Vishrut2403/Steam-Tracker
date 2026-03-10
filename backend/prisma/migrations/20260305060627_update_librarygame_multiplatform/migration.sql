/*
  Warnings:

  - You are about to drop the `achievements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `play_sessions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,platform,platformGameId]` on the table `library_games` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platformGameId` to the `library_games` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_gameId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_userId_fkey";

-- DropForeignKey
ALTER TABLE "play_sessions" DROP CONSTRAINT "play_sessions_gameId_fkey";

-- AlterTable
ALTER TABLE "library_games" ADD COLUMN     "emulatorGame" TEXT,
ADD COLUMN     "emulatorType" TEXT,
ADD COLUMN     "minecraftInstanceName" TEXT,
ADD COLUMN     "minecraftStats" JSONB,
ADD COLUMN     "minecraftUUID" TEXT,
ADD COLUMN     "minecraftWorldName" TEXT,
ADD COLUMN     "minecraftWorldPath" TEXT,
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT 'steam',
ADD COLUMN     "platformData" JSONB,
ADD COLUMN     "platformGameId" TEXT NOT NULL,
ADD COLUMN     "retroAchievementsData" JSONB,
ADD COLUMN     "retroAchievementsId" TEXT,
ALTER COLUMN "appId" DROP NOT NULL,
ALTER COLUMN "playtimeForever" SET DEFAULT 0;

-- DropTable
DROP TABLE "achievements";

-- DropTable
DROP TABLE "games";

-- DropTable
DROP TABLE "play_sessions";

-- DropEnum
DROP TYPE "Platform";

-- CreateIndex
CREATE INDEX "library_games_userId_platform_idx" ON "library_games"("userId", "platform");

-- CreateIndex
CREATE INDEX "library_games_platform_idx" ON "library_games"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "library_games_userId_platform_platformGameId_key" ON "library_games"("userId", "platform", "platformGameId");
