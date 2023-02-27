import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
export declare class ChatService {
    private prisma;
    private UserService;
    constructor(prisma: PrismaService, UserService: UserService);
    alreadyExist(name: string): Promise<boolean>;
    hashedPass(password: string): Promise<string>;
    verifyPass(password: string, hash: string): Promise<boolean>;
    getRooms(id: number): Promise<string[]>;
}
