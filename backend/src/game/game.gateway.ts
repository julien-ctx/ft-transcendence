import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Ball, Paddle } from './objects/objects';

@WebSocketGateway({cors: true})
export class GameGateway {
	constructor(private gameService: GameService) {}

	@WebSocketServer() server: Server;

	@SubscribeMessage('setObjectSize')
	setObjectSize(client: any, objects: { rightPaddle: Paddle, leftPaddle: Paddle, ball: Ball }): void {
		this.gameService.game(objects.rightPaddle, objects.leftPaddle, objects.ball);
  	}
}
