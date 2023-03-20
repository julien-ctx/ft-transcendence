/*
  Warnings:

  - You are about to drop the column `id_user1` on the `GameHistory` table. All the data in the column will be lost.
  - You are about to drop the column `id_user2` on the `GameHistory` table. All the data in the column will be lost.
  - Added the required column `winner_side` to the `GameHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameHistory" DROP COLUMN "id_user1",
DROP COLUMN "id_user2",
ADD COLUMN     "winner_side" INTEGER NOT NULL;
