import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { delay } from 'rxjs';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Ball, Paddle } from './objects/objects';

@WebSocketGateway({cors: true})
export class GameGateway {
	constructor(private gameService: GameService) {}

	@WebSocketServer() server: Server;

	@SubscribeMessage('setObjects')
	setObjects(client: any, data: { rightPaddle: any, leftPaddle: any, ball: any }): void {
		this.gameService.startGame(data.rightPaddle, data.leftPaddle, data.ball);
		client.emit('data', data);
  	}
}
