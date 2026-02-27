/*
  Warnings:

  - You are about to drop the column `appId` on the `steam_wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `steam_wishlist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "steam_wishlist_userId_appId_key";

-- AlterTable
ALTER TABLE "steam_wishlist" DROP COLUMN "appId",
DROP COLUMN "genres";
