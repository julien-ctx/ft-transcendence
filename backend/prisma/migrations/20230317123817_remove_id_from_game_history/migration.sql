/*
  Warnings:

  - You are about to drop the column `id_user1` on the `GameHistory` table. All the data in the column will be lost.
  - You are about to drop the column `id_user2` on the `GameHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameHistory" DROP COLUMN "id_user1",
DROP COLUMN "id_user2";
