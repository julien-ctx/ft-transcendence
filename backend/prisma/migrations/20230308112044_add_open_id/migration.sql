/*
  Warnings:

  - You are about to drop the column `is_open` on the `RoomMessagePrivate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RoomMessagePrivate" DROP COLUMN "is_open",
ADD COLUMN     "open_id" INTEGER[];
