/*
  Warnings:

  - You are about to drop the column `achievementPercentage` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `completedAchievements` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `emulatorGame` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `emulatorType` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `headerImage` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `imgIconUrl` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `imgLogoUrl` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `minecraftInstanceName` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `minecraftStats` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `minecraftUUID` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `minecraftWorldName` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `minecraftWorldPath` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `retroAchievementsData` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `retroAchievementsId` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `totalAchievements` on the `library_games` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `steam_wishlist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,platformGameId,platform]` on the table `library_games` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "steam_wishlist" DROP CONSTRAINT "steam_wishlist_userId_fkey";

-- DropIndex
DROP INDEX "game_sessions_platform_idx";

-- DropIndex
DROP INDEX "game_sessions_userId_date_idx";

-- DropIndex
DROP INDEX "library_games_rating_idx";

-- DropIndex
DROP INDEX "library_games_tier_idx";

-- DropIndex
DROP INDEX "library_games_userId_appId_key";

-- DropIndex
DROP INDEX "library_games_userId_platform_idx";

-- DropIndex
DROP INDEX "library_games_userId_platform_platformGameId_key";

-- AlterTable
ALTER TABLE "library_games" DROP COLUMN "achievementPercentage",
DROP COLUMN "appId",
DROP COLUMN "completedAchievements",
DROP COLUMN "completedAt",
DROP COLUMN "emulatorGame",
DROP COLUMN "emulatorType",
DROP COLUMN "genres",
DROP COLUMN "headerImage",
DROP COLUMN "imgIconUrl",
DROP COLUMN "imgLogoUrl",
DROP COLUMN "minecraftInstanceName",
DROP COLUMN "minecraftStats",
DROP COLUMN "minecraftUUID",
DROP COLUMN "minecraftWorldName",
DROP COLUMN "minecraftWorldPath",
DROP COLUMN "retroAchievementsData",
DROP COLUMN "retroAchievementsId",
DROP COLUMN "tier",
DROP COLUMN "totalAchievements",
ADD COLUMN     "achievementsEarned" INTEGER,
ADD COLUMN     "achievementsTotal" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "playtimeForever" DROP NOT NULL,
ALTER COLUMN "playtimeForever" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userTags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "platform" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
ADD COLUMN     "autoSyncEmulators" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoSyncRA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoSyncSteam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "enablePCSX2" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enablePPSSPP" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableRPCS3" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "raApiKey" TEXT,
ADD COLUMN     "raLinkedAt" TIMESTAMP(3),
ADD COLUMN     "raUsername" TEXT,
ADD COLUMN     "steamAvatar" TEXT,
ADD COLUMN     "steamLinkedAt" TIMESTAMP(3),
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "steamId" DROP NOT NULL;

-- DropTable
DROP TABLE "steam_wishlist";

-- CreateIndex
CREATE INDEX "game_sessions_date_idx" ON "game_sessions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "library_games_userId_platformGameId_platform_key" ON "library_games"("userId", "platformGameId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
