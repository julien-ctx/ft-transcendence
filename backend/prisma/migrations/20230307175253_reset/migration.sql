-- AlterTable
ALTER TABLE "RoomToUser" ADD COLUMN     "Muted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RoomPrivate" (
    "id" SERIAL NOT NULL,
    "id_users" INTEGER[],

    CONSTRAINT "RoomPrivate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessagePrivate" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER NOT NULL,
    "is_updated" BOOLEAN NOT NULL DEFAULT false,
    "id_room" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MessagePrivate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomPrivateToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomPrivateToUser_AB_unique" ON "_RoomPrivateToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomPrivateToUser_B_index" ON "_RoomPrivateToUser"("B");

-- AddForeignKey
ALTER TABLE "MessagePrivate" ADD CONSTRAINT "MessagePrivate_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "RoomPrivate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomPrivateToUser" ADD CONSTRAINT "_RoomPrivateToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomPrivate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomPrivateToUser" ADD CONSTRAINT "_RoomPrivateToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
