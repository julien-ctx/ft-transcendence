
-- CreateTable
-- CREATE TABLE "Banned" (
--     "id" SERIAL NOT NULL,
--     "id_room" INTEGER NOT NULL,
--     "id_user" INTEGER NOT NULL,
--     "endBan" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "Banned_pkey" PRIMARY KEY ("id")
-- );

-- -- AddForeignKey
-- ALTER TABLE "Banned" ADD CONSTRAINT "Banned_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "Banned" ADD CONSTRAINT "Banned_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
