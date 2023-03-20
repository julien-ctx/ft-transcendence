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

	forSameUser(user : any, event : string, params : any) {
		const Same = this.Client.filter((elem : any) => {
			// console.log(elem.user?.id, user.id_user);
			if (elem.user?.id === user.id_user)
				return elem;
		});
		// console.log('Same OUR ->', Same);
		Same.forEach((elem : any) => {
			elem.client.emit(event, params);
		});
	}

	forOtherUser(user : any, event : string, params : any) {
		const Same = this.Client.filter((elem : any) => {
			// console.log(elem.user.id, user.id);
			if (elem.user.id !== user.id_user)
				return elem;
		});
		// console.log('Same OTHER -> ', Same);
		Same.forEach((elem : any) => {
			elem.client.emit(event, params);
		});
	}

	async handleConnection(client: any, ...args: any[]) {
		const token = client.handshake.query.token as string;
		if (token === null) return;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		if (user === null) return;
		// console.log({user});
		this.Client.push({user, client});
		// console.log(user);
	}


	@SubscribeMessage('createRoom')
	async handleCreateRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		// console.log('USER->', user);
		let err = new errors(data.roomStatus, data.roomName, data.roomDesc, data.roomPass, data.roomPassConfirm);
		err.handle();
		let already = await this.chatService.alreadyExist(data.roomName);
		if (already === true) {
			err.errs.name = 'Room already exist';
		}
		if (err.hasErrors()) {
			// console.log('error : ', err.errs.status , err.errs.name, err.errs.desc, err.errs.pass, err.errs.cpass);
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
		const Room = await this.chatService.getRoomByName(data.roomName);
		const params = {name : room.name, owner : true, status : room.status, admin : true};
		client.emit('successCreate');
		this.forSameUser(User, 'rooms', params);
		if (Room.status === 'Public')
			this.forOtherUser(User, 'newPublicRoom', Room);
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
		await this.chatService.updateBan(room, this.Client);
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
		if (room.status === 'Private') {
			client.emit('errors', {already : 'This channel is private'});
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
		this.forSameUser(User, 'rooms', {
			name : room.name,
			owner : false,
			status : room.status,
			admin : false,
		});
		const newUser = await this.prisma.roomToUser.findFirst({
			where : {
				id_user : User.id_user,
				id_room : room.id,
			},
			include : {
				user : true,
				room : true,
			}
		})
		this.Client.forEach((elem : any) => {
			elem.client.emit('newMembers', {
				roomName : room.name,
				member : newUser,
			});
		});

		return ;
	}

	@SubscribeMessage('joinInvite')
	async handleJoinInvite(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;
		
		const User = await this.prisma.user.findUnique({
			where: {
				id_user: user['id'],
			},
		});
		const Room = await this.chatService.getRoomByName(data.roomName);
		await this.chatService.updateBan(Room, this.Client);
		const createRelation = await this.prisma.roomToUser.create({
			data: {
				room: {
					connect: {
						id: Room.id,
					}
				},
				user: {
					connect: {
						id: User.id,
					}
				},
			},
			include : {
				user : true
			}
		});
		this.forSameUser(User, 'rooms', {
			name : Room.name,
			owner : false,
			status : Room.status,
			admin : false,
			});
		this.server.emit('newMembers', {
			member : createRelation,
			roomName : Room.name,
		});

	}

	@SubscribeMessage('leaveRoom')
	async handleLeaveRoom(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined || user === null) return;

		const idUser : number = user['id'];
		const User = await this.prisma.user.findUnique({
			where: {
				id_user: idUser,
			}
		});
		const room = await this.chatService.getRoomByName(data.roomName);
		await this.chatService.updateBan(room, this.Client);
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user: User.id_user,
				id_room: room.id,
			}
		});
		if (relation[0] === undefined) return ;
		if (relation[0].owner === true) {
			if (room.status === 'Public') {
				this.server.emit('update-public-room', {
					roomName : room.name,
					room : room,
					removed : true,
				})
			}
			await this.prisma.roomToUser.deleteMany({
				where : {
					id_room : room.id,
				}
			})
			await this.prisma.banned.deleteMany({
				where : {
					id_room : room.id,
				}
			})
			await this.prisma.messageRoom.deleteMany({
				where : {
					id_room : room.id,
				}
			})
			await this.prisma.room.delete({
				where: {
					id: room.id,
				}
			});
			this.server.emit('deletedRoom', data.roomName);
			return ;
		} else {
			await this.prisma.roomToUser.delete({
				where: {
					id: relation[0].id,
				}
			});
			await this.prisma.messageRoom.deleteMany({
				where : {
					id_user : User.id_user
				}
			})
		}
		// client.emit('deletedRoom', data.roomName);
		this.forSameUser(User, 'deletedRoom', data.roomName);
		client.emit('deletedRoom', data.roomName);
		if (room.status === 'Public') {
			this.forSameUser(User, 'newPublicRoom', room);
		}
		this.server.emit("memberLeaveRoom", "ok")
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
		await this.chatService.updateBan(Room, this.Client);
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
		await this.chatService.updateBan(Room, this.Client);
		if (await this.chatService.muteUpdate(Room, User) === false) {
			const relation = await this.prisma.roomToUser.findFirst({
				where: {
					id_user: User.id_user,
					id_room: Room.id,
				}
			});
			const time = this.chatService.getDateMute(relation.EndMute);
			client.emit('muted', time);
			return ;
		}
		const message = await this.chatService.createMessage(User.id, Room.id, data.message);
		const roomInstance = await this.chatService.getRoomByName(data.roomName);
		const userInRoom = await this.chatService.getUsersRooms(User.id, roomInstance.name);
		this.Client.forEach((elem : any) => {
			userInRoom.forEach((oneUser : User) => {
				if (elem.user === null)
					return ;				
				else if (elem.user.id == oneUser.id_user) {
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
		if (data.password === '') return ;
		const valide = await this.chatService.verifyPass(data.password, Room.password);
		// console.log(valide);
		if (valide === false) 
			client.emit('wrongEdit', {
				roomName: Room.name,
				error : 'Wrong password',
			});
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
		await this.chatService.updateBan(Room, this.Client);

		if (data.Pass !== data.Cpass) {
			client.emit('badChangePass', {
				roomName: Room.name,
				error : 'Password must match',
			})
			return;
		}

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
		client.emit('successEdit', {
			roomName: Room.name,
		});
	}

	@SubscribeMessage('changeStatus')
	async handleChangeStatus(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);
		const relation = await this.chatService.getMyRelation(User.id_user, Room.name);

		if (relation.admin !== true) return ;
		if (data.pass !== data.cpass) {
			client.emit('badPass', {
				roomName : Room.name,
				error : 'Password must match',
			});
			return ;
		}
		else {
			// console.log('Pass ->', data.pass);
			if (Room.status === 'Public') {
				this.server.emit('update-public-room', {
					roomName : Room.name,
					
				});
			}
			let mdp = await this.chatService.hashedPass(data.pass);
			const newRoom = await this.prisma.room.update({
				where: {
					id: Room.id,
				},
				data: {
					status: 'Protected',
					password: mdp,
				},
			});
			this.forSameUser(User, 'successChangeStatus', {
				roomName: Room.name,
				status: 'Protected',
			});
			client.emit('updateRoom', {
				name: Room.name, 
				owner: relation.owner, 
				status: newRoom.status, 
				admin: relation.admin,
			});
			if (Room.status === 'Public') {
				this.server.emit('update-public-room', {
					roomName : Room.name,
				})
			}
		}
	}

	@SubscribeMessage('sanction')
	async handleAdmin(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);
		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === false) return;
		const relation = await this.chatService.getMyRelation(User.id_user, Room.name);
		if (relation.admin !== true) return;
		new Sanction(this.Rooms, this.Client, data, this.prisma, client).handleSanction();
	}

	@SubscribeMessage('mute')
	async handleMute(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === false) return;
		const relation = await this.chatService.getMyRelation(User.id_user, Room.name);
		if (relation.admin !== true) return;

		const relate = await this.prisma.roomToUser.findMany({
			where: {
				id_user : data.member.id_user,
				id_room : Room.id,
			},
			include : {
				user : true,
				room : true,
			}
		});
		let Sanction : Date = new Date();
		let error : boolean = false;
		switch (data.duration) {
			case 'Second':
				Sanction.setSeconds(Sanction.getSeconds() + data.time); break;
			case 'Minutes':
				Sanction.setMinutes(Sanction.getMinutes() + data.time); break;
			case 'Hour':
				Sanction.setHours(Sanction.getHours() + data.time); break;
			case 'Day':
				Sanction.setDate(Sanction.getDate() + data.time); break;
			case 'Month':
				Sanction.setMonth(Sanction.getMonth() + data.time); break;
			default:
				error = true; break;
		}
		if (error === false) {
			const newUser = await this.prisma.roomToUser.update({
				where : {
					id : relate[0].id,
				},
				data : {
					Muted : true,
					EndMute : Sanction,
				},
				include : {
					user : true,
					room : true,
				}
			});
			this.Client.forEach((elem : any) => {
				elem.client.emit('mute', newUser)
			});
		} else return;
	}

	@SubscribeMessage('unmute')
	async handleUnmute(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const room = await this.chatService.getRoomByName(data.roomName);

		const isIn = await this.chatService.isInRoom(User, room);
		if (isIn === false) return;
		const verif = await this.chatService.getMyRelation(User.id_user, room.name);
		if (verif.admin !== true) return;

		const relation = await this.prisma.roomToUser.findFirst({
			where : {
				id_user : data.member.id_user,
				id_room : room.id,
			}
		});
		const newUser = await this.prisma.roomToUser.update({
			where : {
				id : relation.id,
			},
			data : {
				Muted : false,
				EndMute : new Date(),
			},
			include : {
				user : true,
				room : true,
			}
		});
		this.Client.forEach((elem : any) => {
			elem.client.emit('unmute', newUser)
		});
	}

	@SubscribeMessage('OP')
	async handleOP(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		// console.log({data});

		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === false) return;
		const verif = await this.chatService.getMyRelation(User.id_user, Room.name);
		if (verif.admin !== true) return;

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
			// console.log(elem.user);
			// if (elem.user.id === data.member.id_user) {
				elem.client.emit('newRight', {
					roomName : data.roomName,
					admin : true,
					id_user : data.member.id_user,
				});
			// }
		});
		// client.emit('newRight', {
		// 	roomName : data.roomName,
		// 	admin : true,
		// 	id_user : data.member.id_user,
		// });
	}

	@SubscribeMessage('DEOP')
	async handleDEOP(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === false) return;
		const verif = await this.chatService.getMyRelation(User.id_user, Room.name);
		if (verif.admin !== true) return;

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
				admin : false,
			},
		});
		this.Client.forEach((elem) => {
			elem.client.emit('newRight', {
				roomName : data.roomName,
				admin : false,
				id_user : data.member.id_user,
			});
		});
	}

	@SubscribeMessage('joinPublics')
	async handleJoinPublics(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === true)  {
			client.emit('update-public-room', {
				roomName : Room.name,
				room : Room,
				removed : true,
			})
			return;
		}

		const relation = await this.prisma.roomToUser.create({
			data : {
				id_user : User.id_user,
				id_room : Room.id,
			},
			include : {
				user : true,
				room : true,
			}
		});
		this.Client.forEach((elem : any) => {
			elem.client.emit('newMembers', {
				roomName : Room.name,
				member : relation,
			});
		});
		this.forSameUser(User, 'rooms', {
			name : Room.name,
			owner : false,
			status : Room.status,
			admin : false,
		});
		this.forSameUser(User, 'update-public-room', {
			roomName : Room.name,
			room : Room,
			removed : true,
		})
	}

	@SubscribeMessage('setPublic')
	async handleSetPublic(@ConnectedSocket() client, @MessageBody() data: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined) return;

		const User = await this.Service.getOneById(user['id']);
		const Room = await this.chatService.getRoomByName(data.roomName);

		const isIn = await this.chatService.isInRoom(User, Room);
		if (isIn === false) return;
		const verif = await this.chatService.getMyRelation(User.id_user, Room.name);
		if (verif.owner !== true) return;

		const newRoom = await this.prisma.room.update({
			where : {
				id : Room.id,
			},
			data : {
				status : 'Public',
				password : '',
			}
		});
		this.Client.forEach((elem : any) => {
			elem.client.emit('current-update', {
				roomName : Room.name,
				room : {
					admin : verif.admin,
					owner : verif.owner,
					status : newRoom.status,
				}
			});
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
				if (elem.user.id == body.user_receive[i].id_user) {
					elem.client.emit('event-write', room);
				}
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
				if (elem.user.id == body.user_receive[i].id_user) {
					elem.client.emit('event-write', room);
				}
			}
		})
	}

	handleDisconnect(client: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user === undefined || user === null) return;

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

