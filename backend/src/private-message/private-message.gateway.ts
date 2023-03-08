import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User, Notification, RoomMessagePrivate, MessagePrivate } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { UserGuardGateway } from "src/user/guard/user.guard.gateway";
import { UserGatewayInterface } from "src/user/interface/user.gateway.interface";
import { UserService } from "src/user/user.service";
import { PrivateMessageService } from "./private-message.service";

@WebSocketGateway({
	path : "/private-message",
	cors: true
})
export class PrivateMessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private usersArr : UserGatewayInterface [] = [];
	
	constructor(private pmService : PrivateMessageService, private jwt : JwtService, private userService : UserService) {}
	@WebSocketServer() server: Server;


	afterInit() {
		console.log("Socket server initialized");
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;

		await this.userService.getOneByIdUser(user['id'])
		.then(async (userGet : User) => {
			this.usersArr.push({user : userGet, client});
		})
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		for (let i = 0; i < this.usersArr.length; i++) {
			if (this.usersArr[i].client.id == client.id) {
				this.usersArr.splice(i, 1);
			}
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("create-room")
	async sendPm(@MessageBody() body : {user_send : any, user_receive : any}) {
		const user1 = await this.userService.getOne(body.user_send.id);
		const user2 = await this.userService.getOne(body.user_receive.id);
		let isCreate : boolean = false;
		let idRoom : number;
		for (let i = 0; i < user2.roomMp.length && i < user1.roomMp.length; i++) {
			if (user1.roomMp[i].id == user2.roomMp[i].id) {
				isCreate= true;
				idRoom = user1.roomMp[i].id;
			}
		}

		if (!isCreate) {
			await this.pmService.createRoomMessagePrivate(body.user_send, body.user_receive)
			.then(async (room) => {
				await this.userService.getOne(body.user_send.id)
				.then(async (user) => {
					this.emitToClientUser("update-user", user);
					await this.pmService.getAllWithIdUser(user.id)
					.then((allRoom) => {
						this.emitToClientRoom("update-room", user, allRoom)
					})
				})
			})
		} else {
			await this.pmService.getRoomPrivate(idRoom)
			.then(async (room) => {
				let arr : number [] = room.open_id;
				if (!arr.includes(user1.id))
					arr.push(user1.id);
				await this.pmService.updateRoomPrivate({
					open_id : {
						set : arr
					}
				}, idRoom)
				.then(async (room) => {
					await this.pmService.getAllMp(room.id)
					.then(async (mp : MessagePrivate[]) => {
						room.mp = mp;
						const userSend = await this.userService.getOne(user1.id);
						this.emitToClientRoom("update-room", userSend, room);
					})
				})
			});
		}	
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("close-room")
	async closeRoom(@MessageBody() body : {id_user : number, id_room : number}) {
		const user = await this.userService.getOne(body.id_user);
		await this.pmService.getRoomPrivate(body.id_room)
		.then(async (room) => {
			let arr : any = this.filterId(room.open_id, body.id_user)
			await this.pmService.updateRoomPrivate({
				open_id : {
					set : arr
				}
			}, room.id)
			.then(async (room) => {
				await this.pmService.getAllMp(room.id)
				.then(async (mp : MessagePrivate[]) => {
					room.mp = mp;
					const userSend = await this.userService.getOne(body.id_user);
					this.emitToClientRoom("update-room", userSend, room);
				})
			})
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("send-mp")
	async sendMp(@MessageBody() body : {id_user_send : number, id_user_receive : number ,id_room : number, content : string}) {
		await this.pmService.createMessagePrivate(body.id_user_send, body.id_room, body.content);
		
		await this.pmService.getRoomPrivate(body.id_room)
		.then(async (room) => {
			await this.pmService.getAllMp(room.id)
			.then(async (mp : MessagePrivate[]) => {
				room.mp = mp;
				const userSend = await this.userService.getOne(body.id_user_send);
				const userReceive = await this.userService.getOne(body.id_user_receive);
				this.emitToClientRoom("update-room", userSend, room);
				this.emitToClientRoom("update-room", userReceive, room);
			})
		})
		// await this.pmService.getAllWithIdUser(body.id_user_send)
		// .then(async (allRoom) => {
		// 	const user = await this.userService.getOne(body.id_user_send);
		// 	this.emitToClientRoom("update-room", user, allRoom);
		// });
		// await this.pmService.getAllWithIdUser(body.id_user_receive)
		// .then(async (allRoom) => {
		// 	const user = await this.userService.getOne(body.id_user_receive);
		// 	this.emitToClientRoom("update-room", user, allRoom);
		// });
	}

	emitToClientUser(event : string, user : User) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == user.id) {
				elem.client.emit(event, user)
			}
		})
	}

	emitToClientRoom(event : string, user : User, room : any) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == user.id) {
				elem.client.emit(event, room)
			}
		})
	}

	filterId(arr : number [], id : number) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === id)
				arr.splice(i, 1);
		}
		return arr;
	}
}