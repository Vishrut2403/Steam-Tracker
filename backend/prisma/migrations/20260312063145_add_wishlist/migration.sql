-- CreateTable
CREATE TABLE "steam_wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[],
    "listPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "recommendationScore" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steam_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "steam_wishlist_userId_idx" ON "steam_wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "steam_wishlist_userId_appId_key" ON "steam_wishlist"("userId", "appId");

-- AddForeignKey
ALTER TABLE "steam_wishlist" ADD CONSTRAINT "steam_wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
