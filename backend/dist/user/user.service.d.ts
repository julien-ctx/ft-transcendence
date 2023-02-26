import { NotifFriend, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(params: any, id: number): Promise<User & {
        notif_friend: NotifFriend[];
    }>;
    getOne(id: number): Promise<User & {
        notif_friend: NotifFriend[];
    }>;
    getAll(id: number): Promise<(User & {
        notif_friend: NotifFriend[];
    })[]>;
    addNotifFriend(userSend: any, userReceive: any): Promise<User & {
        notif_friend: NotifFriend[];
    }>;
}
