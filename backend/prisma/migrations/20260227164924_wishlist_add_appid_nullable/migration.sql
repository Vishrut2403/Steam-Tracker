/*
  Warnings:

  - A unique constraint covering the columns `[userId,appId]` on the table `steam_wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "steam_wishlist" ADD COLUMN     "appId" TEXT,
ADD COLUMN     "genres" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "steam_wishlist_userId_appId_key" ON "steam_wishlist"("userId", "appId");
