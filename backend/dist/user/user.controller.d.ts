/// <reference types="multer" />
import { UserService } from "./user.service";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(req: any): any;
    updateImg(file: Express.Multer.File, req: any): Promise<import(".prisma/client").User>;
    updateLogin(login: any, req: any): Promise<import(".prisma/client").User>;
}
