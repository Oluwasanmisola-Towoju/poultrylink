-- Allow one review from each party per order.
DROP INDEX "reviews_orderId_key";
CREATE UNIQUE INDEX "reviews_orderId_reviewerId_key" ON "reviews"("orderId", "reviewerId");

-- PostgreSQL treats NULL values as distinct in ordinary unique indexes.
CREATE TEMP TABLE conversation_dedup ON COMMIT DROP AS
SELECT
  MIN(id) AS canonical_id,
  ARRAY_AGG(id) AS conversation_ids
FROM "conversations"
WHERE "listingId" IS NULL
GROUP BY "participantOneId", "participantTwoId"
HAVING COUNT(*) > 1;

UPDATE "messages" AS message
SET "conversationId" = dedup.canonical_id
FROM conversation_dedup AS dedup
WHERE message."conversationId" = ANY(dedup.conversation_ids)
  AND message."conversationId" <> dedup.canonical_id;

DELETE FROM "conversations" AS conversation
USING conversation_dedup AS dedup
WHERE conversation.id = ANY(dedup.conversation_ids)
  AND conversation.id <> dedup.canonical_id;

DROP INDEX "conversations_participantOneId_participantTwoId_listingId_key";
CREATE UNIQUE INDEX "conversations_pair_without_listing_key"
  ON "conversations"("participantOneId", "participantTwoId")
  WHERE "listingId" IS NULL;
CREATE UNIQUE INDEX "conversations_pair_with_listing_key"
  ON "conversations"("participantOneId", "participantTwoId", "listingId")
  WHERE "listingId" IS NOT NULL;
