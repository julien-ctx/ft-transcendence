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
import { RoomClass } from './room.interface';
import { Socket } from 'dgram';
import { Sanction } from './sanction.class';
import { UseGuards } from '@nestjs/common';
import { UserGuardGateway } from 'src/user/guard/user.guard.gateway';
import { User } from '@prisma/client';

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
				owner : true,
				admin : true,
		}
		});
		client.emit('successCreate');
		client.emit('rooms', {
			name : room.name,
			owner : true,
			status : room.status,
			admin : true,
		});
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
			},
			include : {
				banned : true,
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
		let Ban = false;
		room.banned.forEach(ban => {
			if (ban.id_user === User.id_user) {
				let now : Date = new Date();
				if (now > ban.endBan) {
					this.prisma.banned.delete({
						where: {
							id: ban.id,
						}
					});
					// return ;
				} else {
					client.emit('errors', {already : 'You are banned from this room'});
					Ban = true;
					return ;
				}
			}
		});
		if (Ban)
			return ;
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
		client.emit('rooms', {
			name : room.name,
			owner : false,
			status : room.status,
			admin : false,
		});
		return ;
	}

	@SubscribeMessage('leaveRoom')
	async handleLeaveRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const idUser : number = user['id'];
		const User = await this.prisma.user.findUnique({
			where: {
				id_user: idUser,
			}
		});
		const room = await this.chatService.getRoomByName(data.roomName);
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user: User.id_user,
				id_room: room.id,
			}
		});
		
		if (relation.length === 1) {
			await this.prisma.roomToUser.delete({
				where: {
					id: relation[0].id,
				}
			});
			await this.prisma.banned.deleteMany({
				where: {
					id_room: room.id,
				}
			});
			await this.prisma.room.delete({
				where: {
					id: room.id,
				}
			});
		}
		else if (relation.length > 1) {
			await this.prisma.roomToUser.delete({
				where: {
					id: relation[0].id,
				}
			});
		}
		
		client.emit('deletedRoom', data.roomName);
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
		
		// console.log(this.findRoom(Room.name));
		let roomInstance = this.findRoom(Room.name);
		if (roomInstance === undefined) {
			roomInstance = new RoomClass(User, client, Room.name);
			this.Rooms = [...this.Rooms, roomInstance];
		}
		else {
			// console.log('Is in the room : ', roomInstance.isHere(User));
			if (roomInstance.isHere(User) === false)
				roomInstance.addUser(User, client);
			else 
				roomInstance.changeClient(User, client);
		}

		Room.Message.forEach((message) => {
			client.emit('getMessages', {
				message : message.content,
				user : message.id_user,
			});
		});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		
		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);
		const message = await this.chatService.createMessage(User.id, Room.id, data.message);
		const roomInstance = await this.chatService.getRoomByName(data.roomName);
		const userInRoom = await this.chatService.getUsersRooms(User.id, roomInstance.name);
		this.Client.forEach((elem : any) => {
			userInRoom.forEach((oneUser : User) => {
				if (elem.user.id == oneUser.id_user) {
					elem.client.emit("update-room", roomInstance);
				}
			})
		})
	}

	@SubscribeMessage('verifPassword')
	async handleVerifPassword(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		// console.log(data);
		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);
		const valide = await this.chatService.verifyPass(data.password, Room.password);
		// console.log(valide);
		if (valide === false) 
			client.emit('wrongEdit', 'Wrong password');
		else
			client.emit('successVerify');
	}

	@SubscribeMessage('changePass')
	async handleChangePass(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);
		
		let mdp = await this.chatService.hashedPass(data.Pass);
		// console.log(mdp);
		await this.prisma.room.update({
			where: {
				id: Room.id,
			},
			data: {
				password: mdp,
			},
		});
		client.emit('successEdit');
	}

	@SubscribeMessage('sanction')
	async handleAdmin(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		const t = new Sanction(this.Rooms, this.Client, data, this.prisma, client);
		t.handleSanction();
	}

	@SubscribeMessage('OP')
	async handleOP(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		console.log({data});

		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user : data.member.id_user,
				id_room : Room.id,
			}
		});
		await this.prisma.roomToUser.update({
			where :{
				id : relation[0].id
			},
			data : {
				admin : true,
			},
		});
		this.Client.forEach((elem) => {
			// console.log(elem.user.id_user);
			// console.log(data.member.id_user);
			if (elem.user.id_user === data.member.id_user) {
				elem.client.emit('OP', data.roomName);
			}
		});
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("write")
	async write(@MessageBody() body : {user_receive : User [], room : any, login : string}) {
		let room = body.room;		
		if (room.write && !room.write.includes(body.login))
			room.write.push(body.login);
		else if (!room.write)
			room.write = [body.login]
		this.Client.forEach((elem : any) => {
			for (let i = 0; i < body.user_receive.length; i++) {
				if (elem.user.id == body.user_receive[i].id_user)
					elem.client.emit('event-write', room);
			}
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("unwrite")
	async unwrite(@MessageBody() body : {user_receive : User [], room : any, login : string}) {
		let room = body.room;
		if (room.write) {
			for (let i = 0; i > room.write.length; i++) {
				if (room.write[i].login == body.login)
					room.write.splice(i, 1);
			}		
		}
		this.Client.forEach((elem : any) => {
			for (let i = 0; i < body.user_receive.length; i++) {
				if (elem.user.id == body.user_receive[i].id_user)
					elem.client.emit('event-write', room);
			}
		})
	}

	handleDisconnect(client: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = this.prisma.user.findUnique({
			where: {
				id_user: user['id'],
			}
		});
		this.Rooms.forEach((room) => {
			room.removeUser(User);
		});
	}

	findRoom(name: string) {
		// console.log('The room', this.Rooms);
		return this.Rooms.find((room) => room.roomName === name);
	}
}

