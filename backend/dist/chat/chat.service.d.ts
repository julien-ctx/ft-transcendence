import { PrismaService } from 'src/prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    alreadyExist(name: string): Promise<boolean>;
    hashedPass(password: string): Promise<string>;
    verifyPass(password: string, hash: string): Promise<boolean>;
    valide(room: string, password: any): Promise<boolean>;
}
