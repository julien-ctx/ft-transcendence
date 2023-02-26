-- AddForeignKey
ALTER TABLE "RoomToUser" ADD CONSTRAINT "RoomToUser_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomToUser" ADD CONSTRAINT "RoomToUser_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
