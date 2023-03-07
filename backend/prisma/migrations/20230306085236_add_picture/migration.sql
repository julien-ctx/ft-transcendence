-- AlterTable
ALTER TABLE "User" ADD COLUMN     "id_picture_user" INTEGER;

-- CreateTable
CREATE TABLE "PictureUser" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "PictureUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PictureUser_id_user_key" ON "PictureUser"("id_user");

-- AddForeignKey
ALTER TABLE "PictureUser" ADD CONSTRAINT "PictureUser_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
