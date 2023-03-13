/*
  Warnings:

  - You are about to drop the column `exp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ranking` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "exp",
DROP COLUMN "lp",
DROP COLUMN "ranking",
ALTER COLUMN "level" SET DEFAULT 0,
ALTER COLUMN "level" SET DATA TYPE DOUBLE PRECISION;
