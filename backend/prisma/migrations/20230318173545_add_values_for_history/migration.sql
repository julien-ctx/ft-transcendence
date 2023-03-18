/*
  Warnings:

  - You are about to drop the column `winner_side` on the `GameHistory` table. All the data in the column will be lost.
  - Added the required column `id_user1` to the `GameHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user2` to the `GameHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img_link_user1` to the `GameHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img_link_user2` to the `GameHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login_user1` to the `GameHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login_user2` to the `GameHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameHistory" DROP COLUMN "winner_side",
ADD COLUMN     "id_user1" INTEGER NOT NULL,
ADD COLUMN     "id_user2" INTEGER NOT NULL,
ADD COLUMN     "img_link_user1" TEXT NOT NULL,
ADD COLUMN     "img_link_user2" TEXT NOT NULL,
ADD COLUMN     "login_user1" TEXT NOT NULL,
ADD COLUMN     "login_user2" TEXT NOT NULL;
