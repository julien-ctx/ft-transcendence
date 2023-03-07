/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_id_room_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_id_user_fkey";

-- AlterTable
-- ALTER TABLE "RoomToUser" ADD COLUMN     "EndMute" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "Muted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Banned" (
    "id" SERIAL NOT NULL,
    "id_room" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "endBan" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRoom" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_room" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "MessageRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRoom" ADD CONSTRAINT "MessageRoom_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRoom" ADD CONSTRAINT "MessageRoom_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
