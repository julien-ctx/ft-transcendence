/*
  Warnings:

  - You are about to drop the column `kind` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "kind",
DROP COLUMN "status",
ADD COLUMN     "activity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exp" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ranking" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winrate" DOUBLE PRECISION NOT NULL DEFAULT 0;
