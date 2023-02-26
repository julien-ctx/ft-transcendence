/*
  Warnings:

  - Added the required column `img_link` to the `NotifFriend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotifFriend" ADD COLUMN     "img_link" TEXT NOT NULL;
