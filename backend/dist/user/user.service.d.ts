import { NotifFriend, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(params: any, id: number): Promise<User & {
        notif_friend: NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    getOne(id: number): Promise<User & {
        notif_friend: NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    getOneById(id: number): Promise<User & {
        notif_friend: NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    getAll(id: number): Promise<(User & {
        notif_friend: NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    })[]>;
    addNotifFriend(userSend: any, userReceive: any): Promise<User & {
        notif_friend: NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
}
