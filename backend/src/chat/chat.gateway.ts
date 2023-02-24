import { 
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer, 
	OnGatewayDisconnect, 
	OnGatewayConnection,
	MessageBody,
	ConnectedSocket,
	} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { errors } from './errors.handle';

@WebSocketGateway({
	path : '/chat',
	cors: {
		origin: '*',
	  },
})
export class ChatGateway implements OnGatewayDisconnect , OnGatewayConnection{
	constructor(
		private jwt : JwtService,
		private config : ConfigService,
		private Auth : AuthService,
	) {}
	
	@WebSocketServer()
	server: Server;

	private client : any = [];

	async handleConnection(client: any, ...args: any[]) {
		// console.log({client});
		const token = client.handshake.query.token as string;
		const user = await this.Auth.me(token);
		if (user === undefined) return;
		console.log('Conncted user :', {user});
		this.client.push(user);
	}

	@SubscribeMessage('createRoom')
	async handleCreateRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = await this.Auth.me(token);
		if (user === undefined) return;
		this.client.push(user);
		
		let err = new errors(data.roomStatus, data.roomName, data.roomDesc, data.roomPass, data.roomCPass);
		err.handle();
		if (err.hasErrors()) {
			console.log('error : ', err.errs.status , err.errs.name, err.errs.desc, err.errs.pass, err.errs.cpass);
			client.emit('errors', err.errs);
			return ;
		}
	
	}

	handleDisconnect(client: any) {
		console.log('Client disconnected');
		this.client.splice(this.client.indexOf(client), 1);
	}
}

