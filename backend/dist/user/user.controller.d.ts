/// <reference types="multer" />
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(userReq: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    getAll(user: UserDto): Promise<(import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    })[]>;
    getOne(id: string): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    updateImg(file: Express.Multer.File, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    updateLogin(login: any, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
    updateConnected(connected: any, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
        RoomToUser: import(".prisma/client").RoomToUser[];
    }>;
}
