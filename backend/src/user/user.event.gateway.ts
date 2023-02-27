import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server } from "socket.io";
import { UserGuardGateway } from "./guard/user.guard.gateway";
import { UserService } from "./user.service";


@WebSocketGateway({
	path : "/event_user",
	cors: true
})
export class UserEventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private usersArr : any = [];
	
	constructor(private userService : UserService, private jwt : JwtService) {}
	@WebSocketServer() server: Server;


	afterInit() {
		console.log("Socket server initialized");
	}

	async handleConnection(@ConnectedSocket() client: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		this.usersArr.push({user, client});
		await this.userService.getOneByIdUser(user['id'])
		.then(async (res) => {
			await this.userService.updateUser({
				status : 1
			}, res.id)
			.then((res) => {
				this.server.emit("event_user", res)
			})
		})
	}

	async handleDisconnect(@ConnectedSocket() client: any) {
		this.usersArr.forEach(async elem => {
			if (elem.client.id == client.id) {
				await this.userService.getOneByIdUser(elem.user['id'])
				.then(async (res) => {
					await this.userService.updateUser({
						status : 0
					}, res.id)
					.then((res) => {
						this.server.emit("event_user", res)
					})
				})
			}
			this.usersArr.pop(elem);			
		});	
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("disconnect_user")
	async disconnectUser(@MessageBody() body : any) {
		await this.userService.updateUser({
			status : 0
		}, body.id)
		.then((res) => {
			this.server.emit("event_user", res);
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("update_user")
	async updateUser(@MessageBody() body : any) {
		const [login, img_link] = [body.login, body.img_link];
		await this.userService.updateUser({
			login,
			img_link
		}, body.id)
		.then((res) => {
			this.server.emit("event_user", res);
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("block_user")
	async blockUser(@MessageBody() body : any) {
		console.log(body);
		await this.userService.getOne(body.id_user_send)
		.then(async (res) => {
			const idNotif = this.userService.getIdNotif(res.notification, body.id_user_receive);
			const friendId = this.userService.filterId(res.friend_id, body.id_user_receive);
			const reqSendFriend = this.userService.filterId(res.req_send_friend, body.id_user_receive);
			const reqReceivedFriend = this.userService.filterId(res.req_received_friend, body.id_user_receive);
			if (idNotif != undefined) {
				await this.userService.updateUser({
					notification : {
						deleteMany : {
							id : idNotif
						}
					},
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
				.then((res) => {
					this.emitToClient(res);
					console.log(res);
					
				})
			} else {
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
				.then((res) => {
					this.emitToClient(res);
					console.log(res);
					
				})
			}
		})

		await this.userService.getOne(body.id_user_receive)
		.then(async (res) => {
			const idNotif = this.userService.getIdNotif(res.notification, body.id_user_send);
			const friendId = this.userService.filterId(res.friend_id, body.id_user_send);
			const reqSendFriend = this.userService.filterId(res.req_send_friend, body.id_user_send);
			const reqReceivedFriend = this.userService.filterId(res.req_received_friend, body.id_user_send);
			if (idNotif != undefined) {
				await this.userService.updateUser({
					notification : {
						delete : {
							id : idNotif
						}
					},
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
				.then((res) => {
					this.emitToClient(res);
					console.log(res);
					
				})
			} else {
				console.log("coucou");
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
				.then((res) => {
					this.emitToClient(res);
					console.log(res);
					
				})
			}
		})
	}

	emitToClient(res : any) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == res.id_user) {
				elem.client.emit("event_user", res)
			}
		})
	}
}