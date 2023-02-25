import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ball, Paddle } from './objects/objects';

@Injectable()
export class GameService {
	private ball: Ball;
	private rightPaddle: Paddle;
	private leftPaddle: Paddle;
	private prisma: PrismaService;

	constructor() {
		this.ball = new Ball();
		this.rightPaddle = new Paddle();
		this.leftPaddle = new Paddle();
	}
	
	game(): string {
		// launch the game and ask the player if it's multiplayer or not
		const isMultiplayer = this.askIsMultiplayer();
		// return a message indicating whether the game is multiplayer or not
		return `The game is ${isMultiplayer ? 'multiplayer' : 'single player'}.`;
	}
	
	private askIsMultiplayer(): boolean {
		// ask the player if it's multiplayer or not
		// return true if the player chooses multiplayer, false otherwise
		return true;
	}

	public updateState(): any {
	
	}
}
