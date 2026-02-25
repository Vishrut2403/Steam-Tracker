-- AlterTable
ALTER TABLE "library_games" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userTags" TEXT[];

-- CreateIndex
CREATE INDEX "library_games_tier_idx" ON "library_games"("tier");

-- CreateIndex
CREATE INDEX "library_games_rating_idx" ON "library_games"("rating");
