
ALTER TABLE "game_journal_entries" ADD COLUMN "heading" TEXT NOT NULL DEFAULT 'Untitled Entry';

WITH numbered_entries AS (
  SELECT 
    id,
    'Entry #' || ROW_NUMBER() OVER (PARTITION BY "gameId" ORDER BY "createdAt")::TEXT AS new_heading
  FROM "game_journal_entries"
)
UPDATE "game_journal_entries" 
SET "heading" = numbered_entries.new_heading
FROM numbered_entries
WHERE "game_journal_entries".id = numbered_entries.id;

ALTER TABLE "game_journal_entries" ALTER COLUMN "heading" DROP DEFAULT;