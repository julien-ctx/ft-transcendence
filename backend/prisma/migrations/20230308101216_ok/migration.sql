/*
  Warnings:

  - You are about to drop the `_RoomMessagePrivate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoomMessagePrivate" DROP CONSTRAINT "_RoomMessagePrivate_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomMessagePrivate" DROP CONSTRAINT "_RoomMessagePrivate_B_fkey";

-- DropTable
DROP TABLE "_RoomMessagePrivate";

-- CreateTable
CREATE TABLE "_RoomUserMessagePrivate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomUserMessagePrivate_AB_unique" ON "_RoomUserMessagePrivate"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomUserMessagePrivate_B_index" ON "_RoomUserMessagePrivate"("B");

-- AddForeignKey
ALTER TABLE "_RoomUserMessagePrivate" ADD CONSTRAINT "_RoomUserMessagePrivate_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomMessagePrivate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomUserMessagePrivate" ADD CONSTRAINT "_RoomUserMessagePrivate_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
