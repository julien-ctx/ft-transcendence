/*
  Warnings:

  - Added the required column `twoFaEnabled` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoFaSecret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFaEnabled" BOOLEAN NOT NULL,
ADD COLUMN     "twoFaSecret" TEXT NOT NULL;
