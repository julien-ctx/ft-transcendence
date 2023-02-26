/*
  Warnings:

  - Added the required column `login_send` to the `NotifFriend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotifFriend" ADD COLUMN     "login_send" TEXT NOT NULL;
