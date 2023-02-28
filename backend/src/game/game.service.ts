import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { delay } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ball, Paddle } from './objects/objects';

@Injectable()
export class GameService {
	constructor (
		public ball: Ball,
		public rightPaddle: Paddle,
		public leftPaddle: Paddle,
		public prisma: PrismaService,
	) {}
	
	startGame(
		rightPaddle: any,
		leftPaddle: any,
		ball: any,
	): void {
		this.rightPaddle.x = rightPaddle.x;
		this.rightPaddle.y = rightPaddle.y;
		this.rightPaddle.width = rightPaddle.width;
		this.rightPaddle.height = rightPaddle.height;

		this.leftPaddle.x = leftPaddle.x;
		this.leftPaddle.y = leftPaddle.y;
		this.leftPaddle.width = leftPaddle.width;
		this.leftPaddle.height = leftPaddle.height;

		this.ball.x = ball.x;
		this.ball.y = ball.y;
		this.ball.size = ball.size;
	}

}
