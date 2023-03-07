/*
  Warnings:

  - You are about to drop the column `id_picture_user` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PictureUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PictureUser" DROP CONSTRAINT "PictureUser_id_user_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "id_picture_user",
ADD COLUMN     "mimetype_img_link" TEXT;

-- DropTable
DROP TABLE "PictureUser";
