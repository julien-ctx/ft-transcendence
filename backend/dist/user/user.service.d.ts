import { PrismaService } from "src/prisma/prisma.service";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateMe(params: any, id: number): Promise<import(".prisma/client").User>;
    getOne(id: number): Promise<import(".prisma/client").User>;
    getAll(id: number): Promise<import(".prisma/client").User[]>;
}
