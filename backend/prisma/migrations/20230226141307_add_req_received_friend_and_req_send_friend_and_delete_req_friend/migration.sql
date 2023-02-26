/*
  Warnings:

  - You are about to drop the column `req_friend` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "req_friend",
ADD COLUMN     "req_received_friend" INTEGER[],
ADD COLUMN     "req_send_friend" INTEGER[];
