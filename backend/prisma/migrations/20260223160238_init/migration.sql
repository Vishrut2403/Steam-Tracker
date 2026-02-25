-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "steamUsername" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playtimeForever" INTEGER NOT NULL,
    "pricePaid" DOUBLE PRECISION,
    "pricePerHour" DOUBLE PRECISION,
    "genres" TEXT[],
    "status" TEXT DEFAULT 'unplayed',
    "rating" INTEGER,
    "imgIconUrl" TEXT,
    "imgLogoUrl" TEXT,
    "headerImage" TEXT,
    "totalAchievements" INTEGER DEFAULT 0,
    "completedAchievements" INTEGER DEFAULT 0,
    "achievementPercentage" DOUBLE PRECISION DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3),

    CONSTRAINT "library_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "genres" TEXT[],
    "finalScore" DOUBLE PRECISION,

    CONSTRAINT "wishlist_games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_steamId_key" ON "users"("steamId");

-- CreateIndex
CREATE INDEX "library_games_userId_idx" ON "library_games"("userId");

-- CreateIndex
CREATE INDEX "library_games_status_idx" ON "library_games"("status");

-- CreateIndex
CREATE UNIQUE INDEX "library_games_userId_appId_key" ON "library_games"("userId", "appId");

-- CreateIndex
CREATE INDEX "wishlist_games_userId_idx" ON "wishlist_games"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_games_userId_appId_key" ON "wishlist_games"("userId", "appId");

-- AddForeignKey
ALTER TABLE "library_games" ADD CONSTRAINT "library_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_games" ADD CONSTRAINT "wishlist_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
