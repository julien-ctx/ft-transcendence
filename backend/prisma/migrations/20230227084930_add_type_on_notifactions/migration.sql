/*
  Warnings:

  - You are about to drop the `NotifFriend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotifFriend" DROP CONSTRAINT "NotifFriend_id_user_receive_fkey";

-- DropTable
DROP TABLE "NotifFriend";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "id_user_receive" INTEGER NOT NULL,
    "id_user_send" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "login_send" TEXT NOT NULL,
    "img_link" TEXT NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_user_receive_fkey" FOREIGN KEY ("id_user_receive") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
