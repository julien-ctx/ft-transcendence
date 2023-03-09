/*
  Warnings:

  - Added the required column `id_user1` to the `RoomMessagePrivate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user2` to the `RoomMessagePrivate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomMessagePrivate" ADD COLUMN     "id_user1" INTEGER NOT NULL,
ADD COLUMN     "id_user2" INTEGER NOT NULL;
