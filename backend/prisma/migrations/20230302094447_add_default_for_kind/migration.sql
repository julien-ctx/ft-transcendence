/*
  Warnings:

  - Made the column `kind` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "kind" SET NOT NULL,
ALTER COLUMN "kind" SET DEFAULT '';
