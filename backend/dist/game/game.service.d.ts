import { PrismaService } from 'src/prisma/prisma.service';
import { Ball, Paddle } from './objects/objects';
export declare class GameService {
    private ball;
    private rightPaddle;
    private leftPaddle;
    private prisma;
    constructor(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle, prisma: PrismaService);
    game(): void;
}
