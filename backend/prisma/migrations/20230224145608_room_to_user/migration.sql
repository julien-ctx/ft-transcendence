-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "password" SET DEFAULT '';

-- CreateTable
CREATE TABLE "RoomToUser" (
    "id" SERIAL NOT NULL,
    "id_room" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "RoomToUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomToUser" ADD CONSTRAINT "RoomToUser_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomToUser" ADD CONSTRAINT "RoomToUser_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
