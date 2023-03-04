import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { delay } from 'rxjs';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Ball, Paddle } from './objects/objects';

@WebSocketGateway({cors: true})
export class GameGateway {
	constructor(private gameService: GameService) {}

	@SubscribeMessage('ready')
	startGame(client: any, data: {canvas: HTMLCanvasElement}) {
		
	}
}
