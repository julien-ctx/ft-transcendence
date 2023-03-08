/*
  Warnings:

  - You are about to drop the column `id_room` on the `MessagePrivate` table. All the data in the column will be lost.
  - You are about to drop the column `id_user` on the `MessagePrivate` table. All the data in the column will be lost.
  - You are about to drop the `RoomPrivate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomPrivateToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_user_receive` to the `MessagePrivate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user_send` to the `MessagePrivate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MessagePrivate" DROP CONSTRAINT "MessagePrivate_id_room_fkey";

-- DropForeignKey
ALTER TABLE "_RoomPrivateToUser" DROP CONSTRAINT "_RoomPrivateToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomPrivateToUser" DROP CONSTRAINT "_RoomPrivateToUser_B_fkey";

-- AlterTable
ALTER TABLE "MessagePrivate" DROP COLUMN "id_room",
DROP COLUMN "id_user",
ADD COLUMN     "id_user_receive" INTEGER NOT NULL,
ADD COLUMN     "id_user_send" INTEGER NOT NULL;

-- DropTable
DROP TABLE "RoomPrivate";

-- DropTable
DROP TABLE "_RoomPrivateToUser";

-- AddForeignKey
ALTER TABLE "MessagePrivate" ADD CONSTRAINT "MessagePrivate_id_user_send_fkey" FOREIGN KEY ("id_user_send") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePrivate" ADD CONSTRAINT "MessagePrivate_id_user_receive_fkey" FOREIGN KEY ("id_user_receive") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
