import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	game() {
		console.log("game")
		return ;
	}
}
