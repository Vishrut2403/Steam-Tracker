/*
  Warnings:

  - Made the column `recommendationScore` on table `steam_wishlist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discountPercent` on table `steam_wishlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "steam_wishlist" ALTER COLUMN "recommendationScore" SET NOT NULL,
ALTER COLUMN "discountPercent" SET NOT NULL;
