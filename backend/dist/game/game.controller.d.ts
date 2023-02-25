import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';
export declare class GameController {
    private gameService;
    private prisma;
    constructor(gameService: GameService, prisma: PrismaService);
    game(): string;
}
