// import { 
// 	SubscribeMessage,
// 	WebSocketGateway, 
// 	WebSocketServer, 
// 	OnGatewayDisconnect, 
// 	OnGatewayConnection,
// 	MessageBody,
// 	ConnectedSocket,
// 	} from '@nestjs/websockets';
// import { Server } from 'socket.io';

// @WebSocketGateway({
// 	path : '/chat',
// 	cors: {
// 		origin: '*',
// 	  },
// })
// export class ChatGateway implements OnGatewayDisconnect , OnGatewayConnection{
// 	constructor() {}
	
// 	@WebSocketServer()
// 	server: Server;


// 	async handleConnection(client: any, ...args: any[]) {

// 	}

// 	@SubscribeMessage('createRoom')
// 	async handleCreateRoom(@ConnectedSocket() client, @MessageBody() data: any) {

// 	}

// 	@SubscribeMessage('joinRoom')
// 	async handleJoinRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		
// 	}

// 	handleDisconnect(client: any) {
// 		console.log('Client disconnected');
// 	}
// }