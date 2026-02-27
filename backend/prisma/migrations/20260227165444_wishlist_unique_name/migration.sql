/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `steam_wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "steam_wishlist_userId_name_key" ON "steam_wishlist"("userId", "name");
