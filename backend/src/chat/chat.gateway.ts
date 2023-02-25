import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayDisconnect{
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('chat')
	handleChat(client: any, payload: any): void {
		this.server.emit('chat', payload);
	}

	handleDisconnect(client: any) {
		console.log('Client disconnected');
	}
}