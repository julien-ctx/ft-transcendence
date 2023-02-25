import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ball, Paddle } from './objects/objects';

@Injectable()
export class GameService {
	constructor (
		private ball: Ball,
		private rightPaddle: Paddle,
		private leftPaddle: Paddle,
		private prisma: PrismaService,
	) {}
	
	game(): void {
		let ball = new Ball();
		let rightPaddle = new Paddle();
		let leftPaddle = new Paddle();	
	}

}
