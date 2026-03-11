-- CreateTable
CREATE TABLE "game_journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_journal_entries_gameId_idx" ON "game_journal_entries"("gameId");

-- CreateIndex
CREATE INDEX "game_journal_entries_userId_idx" ON "game_journal_entries"("userId");

-- CreateIndex
CREATE INDEX "game_journal_entries_createdAt_idx" ON "game_journal_entries"("createdAt");

-- AddForeignKey
ALTER TABLE "game_journal_entries" ADD CONSTRAINT "game_journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_journal_entries" ADD CONSTRAINT "game_journal_entries_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "library_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
