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
import { UserService } from 'src/user/user.service';
import { UsersSocketInterface } from 'src/user/interface/userSocket.interface';
import { RoomClass } from './room.interface';

@WebSocketGateway({
	path : '/chat',
	cors: {
		origin: '*',
	  },
})
export class ChatGateway implements OnGatewayDisconnect , OnGatewayConnection {
	constructor(
		private jwt : JwtService,
		private config : ConfigService,
		private Auth : AuthService,
		private chatService : ChatService,
		private prisma : PrismaService,
		private Service : UserService,
	) {}
	
	@WebSocketServer()
	server: Server;

	private Client : any = [];
	private Rooms : RoomClass [] = [];


	async handleConnection(client: any, ...args: any[]) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		this.Client.push({user, client});
		// console.log('Conncted user :', {user});

	}


	@SubscribeMessage('createRoom')
	async handleCreateRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = await this.jwt.decode(token);
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
		// console.log({user});
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
		client.emit('rooms', room.name);
	}

	@SubscribeMessage('joinRoom')
	async handleJoinRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		else if (data.roomName === '') {
			client.emit('errors', {name : 'Room name is required'});
			return ;
		}

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
		let alreadyJoin = await this.prisma.roomToUser.findMany({
			where: {
				id_user: User.id_user,
				id_room: room.id,
			}
		});

		if (room === null) {
			client.emit('errors', {already : 'Room does not exist'});
			return ;
		}
		else if (alreadyJoin.length > 0) {
			client.emit('errors', {already : 'You already join this room'});
			return ;
		}
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
		}
		await this.prisma.roomToUser.create({
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
		client.emit('rooms', room.name);
		return ;
	}

	@SubscribeMessage('Message')
	handleMessage(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const idUser : number = user['id'];
		const User = this.prisma.user.findUnique({
			where: {
				id_user: idUser,
			}
		});

	}

	@SubscribeMessage('askMessages')
	async handleAskMessage(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const idUser : number = user['id'];
		const User = await this.Service.getOneById(idUser);
		const Room = await this.chatService.getRoomByName(data.roomName);
		
		console.log(this.findRoom(Room.name));
		let roomInstance = this.findRoom(Room.name);
		if (roomInstance === undefined) {
			roomInstance = new RoomClass(User, client, Room.name);
			this.Rooms = [...this.Rooms, roomInstance];
		}
		else {
			roomInstance.addUser(User, client);
		}
		console.log(this.Rooms);

		Room.Message.forEach((message) => {
			client.emit('getMessages', message.content);
		});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		
		// console.log({data});	
		const idUser : number = user['id'];
		const User = await this.Service.getOneById(idUser);
		const Room = await this.chatService.getRoomByName(data.roomName);
		const message = await this.chatService.createMessage(User.id, Room.id, data.message);

		const roomInstance = this.findRoom(Room.name);
		roomInstance.ClientUser.forEach((elem) => {
			elem.Client.emit('getMessages', message.content);
		});
		// client.emit('getMessages', message.content);
	}

	handleDisconnect(client: any) {
		// this.client.splice(this.client.indexOf(client), 1);
	}

	findRoom(name: string) {
		console.log('The room', this.Rooms);
		return this.Rooms.find((room) => room.roomName === name);
	}
}

