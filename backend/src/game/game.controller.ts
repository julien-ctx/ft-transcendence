import { Body, Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(private gameService: GameService, private prisma: PrismaService) {}
}
