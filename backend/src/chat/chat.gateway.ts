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
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';

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
		private chatService : ChatService,
		private prisma : PrismaService,
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
		
		let err = new errors(data.roomStatus, data.roomName, data.roomDesc, data.roomPass, data.roomPassConfirm);
		err.handle();
		let already = await this.chatService.alreadyExist(data.roomName);
		if (already === true) {
			err.errs.name = 'Room already exist';
		}
		if (err.hasErrors()) {
			console.log('error : ', err.errs.status , err.errs.name, err.errs.desc, err.errs.pass, err.errs.cpass);
			client.emit('errors', err.errs);
			return ;
		}

		let mdp = '';
		if (data.roomStatus === 'Protected')
			mdp = await this.chatService.hashedPass(data.roomPass);

		const room = await this.prisma.room.create({
			data: {
				name: data.roomName,
				description: data.roomDesc,
				status: data.roomStatus,
				password: mdp,
			}
		});
		console.log({user});
		const idUser : number = user['id'];
		const User = await this.prisma.user.findUnique({
			where: {
				id_user: idUser,
			}
		});
		const relation = await this.prisma.roomToUser.create({
			data: {
				room: {
					connect: {
						id: room.id,
					}
				},
				user: {
					connect: {
						id: User.id,
					}
			},
		}
		});
		client.emit('successCreate');
	}

	@SubscribeMessage('joinRoom')
	async handleJoinRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = await this.Auth.me(token);
		if (user === undefined) return;

		const room = await this.prisma.room.findUnique({
			where: {
				name: data.roomName,
			}
		});
		const idUser : number = user['id'];
		const User = await this.prisma.user.findUnique({
			where: {
				id_user: idUser,
			}
		});

		if (room === null) {
			client.emit('errors', {already : 'Room does not exist'});
			return ;
		}
		// console.log({room}, {data});
		if (room.status === 'Protected' && data.roomPass === '') {
			client.emit('needPass');
			return;
		}
		else if (room.status === 'Protected' && data.roomPass !== '') {
			let valide = await this.chatService.verifyPass(data.roomPass, room.password);
			if (valide === false) {
				client.emit('errors', {pass : 'Wrong password'});
				return;
			}
			else {
				// Make him join ........
				const relation = await this.prisma.roomToUser.create({
					data: {
						room: {
							connect: {
								id: room.id,
							}
						},
						user: {
							connect: {
								id: User.id,
							}
					},
				}
				});

				client.emit('successJoin');
				return;
			}
		}
		const relation = await this.prisma.roomToUser.create({
			data: {
				room: {
					connect: {
						id: room.id,
					}
				},
				user: {
					connect: {
						id: User.id,
					}
			},
		}
		});
		client.emit('successJoin');
		return ;
	}

	handleDisconnect(client: any) {
		console.log('Client disconnected');
		this.client.splice(this.client.indexOf(client), 1);
	}
}

