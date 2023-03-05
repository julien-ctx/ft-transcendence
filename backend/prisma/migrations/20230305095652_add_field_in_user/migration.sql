/*
  Warnings:

  - You are about to alter the column `exp` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "exp" SET DEFAULT 0,
ALTER COLUMN "exp" SET DATA TYPE INTEGER;
