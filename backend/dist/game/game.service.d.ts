import { PrismaService } from 'src/prisma/prisma.service';
export declare class GameService {
    private prisma;
    constructor(prisma: PrismaService);
    game(): void;
}
