/// <reference types="multer" />
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(userReq: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    }>;
    getAll(user: UserDto): Promise<(import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    })[]>;
    getOne(id: string): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    }>;
    updateImg(file: Express.Multer.File, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    }>;
    updateLogin(login: any, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    }>;
    updateConnected(connected: any, user: UserDto): Promise<import(".prisma/client").User & {
        notif_friend: import(".prisma/client").NotifFriend[];
    }>;
}
