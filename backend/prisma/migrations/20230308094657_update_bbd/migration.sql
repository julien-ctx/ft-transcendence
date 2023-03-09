/*
  Warnings:

  - You are about to drop the column `id_user_receive` on the `MessagePrivate` table. All the data in the column will be lost.
  - You are about to drop the column `mpOpenId` on the `User` table. All the data in the column will be lost.
  - Added the required column `id_room` to the `MessagePrivate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MessagePrivate" DROP CONSTRAINT "MessagePrivate_id_user_receive_fkey";

-- DropForeignKey
ALTER TABLE "MessagePrivate" DROP CONSTRAINT "MessagePrivate_id_user_send_fkey";

-- AlterTable
ALTER TABLE "MessagePrivate" DROP COLUMN "id_user_receive",
ADD COLUMN     "id_room" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mpOpenId";

-- CreateTable
CREATE TABLE "RoomMessagePrivate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMessagePrivate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomMessagePrivate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomMessagePrivate_AB_unique" ON "_RoomMessagePrivate"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomMessagePrivate_B_index" ON "_RoomMessagePrivate"("B");

-- AddForeignKey
ALTER TABLE "MessagePrivate" ADD CONSTRAINT "MessagePrivate_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "RoomMessagePrivate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMessagePrivate" ADD CONSTRAINT "_RoomMessagePrivate_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomMessagePrivate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMessagePrivate" ADD CONSTRAINT "_RoomMessagePrivate_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
