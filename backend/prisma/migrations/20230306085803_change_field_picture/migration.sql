/*
  Warnings:

  - You are about to drop the column `url` on the `PictureUser` table. All the data in the column will be lost.
  - Added the required column `byte` to the `PictureUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `PictureUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `PictureUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PictureUser" DROP COLUMN "url",
ADD COLUMN     "byte" BYTEA NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL;
