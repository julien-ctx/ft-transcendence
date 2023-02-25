/// <reference types="multer" />
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(user: UserDto): UserDto;
    getAll(user: UserDto): Promise<import(".prisma/client").User[]>;
    getOne(id: string): Promise<import(".prisma/client").User>;
    updateImg(file: Express.Multer.File, user: UserDto): Promise<import(".prisma/client").User>;
    updateLogin(login: any, user: UserDto): Promise<import(".prisma/client").User>;
    updateConnected(connected: any, user: UserDto): Promise<import(".prisma/client").User>;
}
