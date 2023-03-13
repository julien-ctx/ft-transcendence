-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalGames" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalGamesWin" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GameHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score_user1" INTEGER NOT NULL,
    "score_user2" INTEGER NOT NULL,
    "id_user_winner" INTEGER NOT NULL,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameHistoryRelation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GameHistoryRelation_AB_unique" ON "_GameHistoryRelation"("A", "B");

-- CreateIndex
CREATE INDEX "_GameHistoryRelation_B_index" ON "_GameHistoryRelation"("B");

-- AddForeignKey
ALTER TABLE "_GameHistoryRelation" ADD CONSTRAINT "_GameHistoryRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "GameHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameHistoryRelation" ADD CONSTRAINT "_GameHistoryRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
