import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { delay } from 'rxjs';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Ball, Paddle } from './objects/objects';

@WebSocketGateway({cors: true})
export class GameGateway {
	constructor(private gameService: GameService) {}

	@WebSocketServer() server: Server;

	requestData(client: any, data: object) {
		client.server.emit('requestData');
	}

	@SubscribeMessage('startGame')
	startGame(client: any, data: { rightPaddle: any, leftPaddle: any, ball: any }): void {
		this.gameService.setData(data.rightPaddle, data.leftPaddle, data.ball);
		setInterval(this.requestData, 1000, client, data);
  	}

	@SubscribeMessage('receiveData')
	receivedData(client: any, data: { rightPaddle: any, leftPaddle: any, ball: any }): void {
		this.gameService.setData(data.rightPaddle, data.leftPaddle, data.ball);
	}	

	@SubscribeMessage('endGame')
	endGame(client: any, data: { rightPaddle: any, leftPaddle: any, ball: any }): void {
	}	
}
