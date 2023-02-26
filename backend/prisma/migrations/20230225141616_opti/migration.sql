/*
  Warnings:

  - You are about to drop the column `id_user` on the `NotifFriend` table. All the data in the column will be lost.
  - Added the required column `id_user_receive` to the `NotifFriend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotifFriend" DROP CONSTRAINT "NotifFriend_id_user_fkey";

-- AlterTable
ALTER TABLE "NotifFriend" DROP COLUMN "id_user",
ADD COLUMN     "id_user_receive" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "NotifFriend" ADD CONSTRAINT "NotifFriend_id_user_receive_fkey" FOREIGN KEY ("id_user_receive") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
