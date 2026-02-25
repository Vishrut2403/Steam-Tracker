/*
  Warnings:

  - You are about to drop the `wishlist_games` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wishlist_games" DROP CONSTRAINT "wishlist_games_userId_fkey";

-- DropTable
DROP TABLE "wishlist_games";

-- CreateTable
CREATE TABLE "steam_wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[],
    "listPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "recommendationScore" DOUBLE PRECISION DEFAULT 0,
    "discountPercent" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steam_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "steam_wishlist_userId_idx" ON "steam_wishlist"("userId");

-- CreateIndex
CREATE INDEX "steam_wishlist_recommendationScore_idx" ON "steam_wishlist"("recommendationScore");

-- AddForeignKey
ALTER TABLE "steam_wishlist" ADD CONSTRAINT "steam_wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
