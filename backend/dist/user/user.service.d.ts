import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "./dto/user.dto";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateMe(user: UserDto): Promise<import(".prisma/client").User>;
}
