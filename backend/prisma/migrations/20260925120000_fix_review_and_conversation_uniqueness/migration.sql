-- ============================================================
-- Fix review uniqueness
-- ============================================================
-- Allow each party to leave one review per order instead of
-- allowing only one review total for an order.

DROP INDEX IF EXISTS "reviews_orderId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_orderId_reviewerId_key"
ON "reviews"("orderId", "reviewerId");


-- ============================================================
-- Deduplicate conversations without a listing
-- ============================================================
-- PostgreSQL treats NULL values as distinct in ordinary unique
-- indexes. Therefore duplicate conversations where listingId
-- is NULL must be consolidated before creating the partial
-- unique index.
--
-- Do NOT use ON COMMIT DROP here. Prisma migration execution
-- may cross transaction boundaries and the temporary table
-- must remain available for all statements below.
-- ============================================================

DROP TABLE IF EXISTS conversation_dedup;

CREATE TEMP TABLE conversation_dedup AS
SELECT
    MIN(id) AS canonical_id,
    ARRAY_AGG(id) AS conversation_ids
FROM "conversations"
WHERE "listingId" IS NULL
GROUP BY
    "participantOneId",
    "participantTwoId"
HAVING COUNT(*) > 1;


-- ============================================================
-- Move messages from duplicate conversations to the canonical
-- conversation before deleting duplicates.
-- ============================================================

UPDATE "messages" AS message
SET "conversationId" = dedup.canonical_id
FROM conversation_dedup AS dedup
WHERE message."conversationId" = ANY(dedup.conversation_ids)
  AND message."conversationId" <> dedup.canonical_id;


-- ============================================================
-- Delete duplicate conversations after their messages have
-- been reassigned.
-- ============================================================

DELETE FROM "conversations" AS conversation
USING conversation_dedup AS dedup
WHERE conversation.id = ANY(dedup.conversation_ids)
  AND conversation.id <> dedup.canonical_id;


-- ============================================================
-- Remove temporary deduplication table explicitly.
-- ============================================================

DROP TABLE IF EXISTS conversation_dedup;


-- ============================================================
-- Replace the old conversation uniqueness index.
-- ============================================================

DROP INDEX IF EXISTS
"conversations_participantOneId_participantTwoId_listingId_key";


-- Only one direct conversation between the same pair of users
-- when there is no listing.
CREATE UNIQUE INDEX IF NOT EXISTS
"conversations_pair_without_listing_key"
ON "conversations"("participantOneId", "participantTwoId")
WHERE "listingId" IS NULL;


-- Only one conversation between the same pair of users for a
-- particular listing.
CREATE UNIQUE INDEX IF NOT EXISTS
"conversations_pair_with_listing_key"
ON "conversations"(
    "participantOneId",
    "participantTwoId",
    "listingId"
)
WHERE "listingId" IS NOT NULL;
