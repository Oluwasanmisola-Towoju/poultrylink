-- Allow one review from each party per order.
DROP INDEX "reviews_orderId_key";
CREATE UNIQUE INDEX "reviews_orderId_reviewerId_key" ON "reviews"("orderId", "reviewerId");

-- PostgreSQL treats NULL values as distinct in ordinary unique indexes.
DROP INDEX "conversations_participantOneId_participantTwoId_listingId_key";
CREATE UNIQUE INDEX "conversations_pair_without_listing_key"
  ON "conversations"("participantOneId", "participantTwoId")
  WHERE "listingId" IS NULL;
CREATE UNIQUE INDEX "conversations_pair_with_listing_key"
  ON "conversations"("participantOneId", "participantTwoId", "listingId")
  WHERE "listingId" IS NOT NULL;
