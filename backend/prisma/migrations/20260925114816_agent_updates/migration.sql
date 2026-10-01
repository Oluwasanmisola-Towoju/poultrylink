-- CreateIndex
CREATE INDEX "conversations_participantOneId_participantTwoId_listingId_idx" ON "conversations"("participantOneId", "participantTwoId", "listingId");
