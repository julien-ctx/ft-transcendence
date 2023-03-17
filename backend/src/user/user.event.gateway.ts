import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { UserGuardGateway } from "./guard/user.guard.gateway";
import { UserGatewayInterface } from "./interface/user.gateway.interface";
import { UserService } from "./user.service";


@WebSocketGateway({
	path : "/event_user",
	cors: true
})
export class UserEventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private usersArr : UserGatewayInterface [] = [];
	
	constructor(private userService : UserService, private jwt : JwtService, private prisma : PrismaService) {}
	@WebSocketServer() server: Server;


	afterInit() {
		console.log("Socket server initialized");
	}

	async handleConnection(@ConnectedSocket() client : Socket) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		await this.userService.getOneByIdUser(user['id'])
		.then(async (userGet : User) => {
			this.usersArr.push({user : userGet, client});
			await this.userService.updateUser({
				activity : 1,
				// twoFaAuth : true
			}, userGet.id)
			.then((user : User) => {
				this.server.emit("event_user", user)
			})
		})
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		for (let i = 0; i < this.usersArr.length; i++) {
			if (this.usersArr[i].client.id == client.id) {
				await this.userService.updateUser({
					activity : 0
				}, this.usersArr[i].user.id)
				.then((user : User) => {
					this.server.emit("event_user", user)
				})
				this.usersArr.splice(i, 1);
			}
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("disconnect_user")
	async disconnectUser(@MessageBody() user : User) {
		await this.userService.updateUser({
			activity : 0,
		}, user.id)
		.then((userUpdate : User) => {
			this.server.emit("event_user", userUpdate);
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("update_user")
	async updateUser(@MessageBody() user : User) {
		const [login, img_link] = [user.login, user.img_link];
		await this.userService.updateUser({
			login,
			img_link
		}, user.id)
		.then((userUpdate : User) => {
			this.server.emit("event_user", userUpdate);
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("block_user")
	async blockUser(@MessageBody() body : {id_user_send : number, id_user_receive : number}) {
		try {
			await this.prisma.notification.deleteMany({
				where : {
					id_user_send : body.id_user_send,
					id_user_receive : body.id_user_receive
				}
			})

			await this.prisma.notification.deleteMany({
				where : {
					id_user_send : body.id_user_receive,
					id_user_receive : body.id_user_send
				}
			})

			await this.userService.getOne(body.id_user_send)
			.then(async (res) => {
				const friendId = this.userService.filterId(res.friend_id, body.id_user_receive);
				const reqSendFriend = this.userService.filterId(res.req_send_friend, body.id_user_receive);
				const reqReceivedFriend = this.userService.filterId(res.req_received_friend, body.id_user_receive);
	
				await this.userService.updateUser({
					req_send_friend : {
						set : reqSendFriend
					},
					req_received_friend : {
						set : reqReceivedFriend
					},
					friend_id : {
						set : friendId
					},
					block_id : {
						push : body.id_user_receive
					}
				}, res.id)
				.then((userUpdate : User) => {
					this.emitToClient(userUpdate, "update_me");
					this.server.emit("event_user", userUpdate);
				})
			})
	
			await this.userService.getOne(body.id_user_receive)
			.then(async (res) => {
				const friendId = this.userService.filterId(res.friend_id, body.id_user_send);
				const reqSendFriend = this.userService.filterId(res.req_send_friend, body.id_user_send);
				const reqReceivedFriend = this.userService.filterId(res.req_received_friend, body.id_user_send);
	
				await this.userService.updateUser({
					req_send_friend : {
						set : reqSendFriend
					},
					req_received_friend : {
						set : reqReceivedFriend
					},
					friend_id : {
						set : friendId
					}
				}, res.id)
				.then((userUpdate : User) => {
					this.emitToClient(userUpdate, "update_me");
					this.server.emit("event_user", userUpdate);
				})
			})
		} catch (error) {
			throw error
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("unblock_user")
	async unblockUser(@MessageBody() body : {id_user_send : number, id_user_receive : number}) {
		try {
			const user1 = await this.userService.getOne(body.id_user_send);
			const user2 = await this.userService.getOne(body.id_user_receive);
			let idRoom : number = 0;
			for (let i = 0; i < user2.roomMp.length && i < user1.roomMp.length; i++) {
				if (user1.roomMp[i].id == user2.roomMp[i].id) {
					idRoom = user1.roomMp[i].id;
				}
			}
			if(idRoom != 0) {
				await this.prisma.roomMessagePrivate.update({
					where : {
						id : idRoom
					},
					data : {
						open_id : {
							set : []
						}
					}
				})
				.then((roomUpdated) => {
					this.server.emit("room-unblock", roomUpdated);
				})
			}
			await this.userService.getOne(body.id_user_send)
			.then(async (user : User) => {
				const blockId = this.userService.filterId(user.block_id, body.id_user_receive);
				await this.userService.updateUser({
					block_id : {
						set : blockId
					}
				}, user.id)
				.then((userUpdate : User) => {
					this.emitToClient(userUpdate, "update_me");
					this.server.emit("event_user", userUpdate);
				})
			})
		} catch (error) {
			throw error
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("notification_mp")
	async notificationMp(@MessageBody() body : {user_send : User, user_receive : User , id_room : number, content : string}) {
		// const notif = await this.prisma.notification.findFirst({
		// 	where : {
		// 		id_user_send : body.user_send.id,
		// 		id_user_receive : body.user_receive.id,
		// 		type : 1
		// 	}
		// })
		// if (!notif) {
		// 	await this.userService.addNotifMsg(body.user_send, body.user_receive)
		// 	.then((userUpdate) => {
		// 		this.emitToClient(userUpdate, "update_me");
		// 	})
		// }
		await this.userService.getOne(body.user_receive.id)
		.then((user : User) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == user.id) {
					elem.client.emit("notification_mp", {user, content : body.content, user_send : body.user_send})
				}
			})
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("notification_room")
	async notificationRoom(@MessageBody() body : {user_send : User, user_receive : User , room_name : string}) {
		const notif = await this.prisma.notification.findFirst({
			where : {
				id_user_send : body.user_send.id,
				id_user_receive : body.user_receive.id,
				type : 2
			}
		})
		if (!notif) {
			await this.userService.addNotifRoom(body.user_send, body.user_receive, body.room_name)
			.then((userUpdate) => {
				this.emitToClient(userUpdate, "update_me");
			})
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("notification_game")
	async notificationGame(@MessageBody() body : {user_send : User, user_receive : User}) {
		const notif = await this.prisma.notification.findFirst({
			where : {
				id_user_send : body.user_send.id,
				id_user_receive : body.user_receive.id,
				type : 3
			}
		})
		if (!notif) {
			await this.userService.addNotifGame(body.user_send, body.user_receive)
			.then((userUpdate) => {
				this.emitToClient(userUpdate, "update_me");
			})
		}
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("delete-notification")
	async deleteNotificiation(@MessageBody() body : {id_notif : number, user : User}) {
		await this.prisma.notification.delete({
			where : {
				id : body.id_notif
			}
		})
		await this.userService.getOne(body.user.id)
		.then((userUpdate) => {
			this.emitToClient(userUpdate, "update_me");
		})
	}

	emitToClient(user : User, event : string) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == user.id) {
				elem.client.emit(event, user)
			}
		})
	}
}