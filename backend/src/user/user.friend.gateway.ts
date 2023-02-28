import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User, Notification } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { UserGuardGateway } from "./guard/user.guard.gateway";
import { UserGatewayInterface } from "./interface/user.gateway.interface";
import { UserService } from "./user.service";


@WebSocketGateway({
	path : "/notif_friend",
	cors: true
})
export class UserFriendGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private usersArr : UserGatewayInterface [] = [];
	
	constructor(private userService : UserService, private jwt : JwtService) {}
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
	@SubscribeMessage("add_friend")
	async addFriend(@MessageBody() body : {user_send : User, user_receive : User}) {
		const [userSend, userReceive] = [body.user_send, body.user_receive];
	
		//Update user receive, create notif friend and connect this with array notifications
		await this.userService.addNotifFriend(userSend, userReceive)
		.then((res) => {
			this.emitToClient(res);
		});

		//Update user send, push in req_send_friend id_user_receive
		await this.userService.updateUser({
			req_send_friend: {
				push: userReceive.id
			}
		}, userSend.id)
		.then((userUpdate : User) => {
			this.emitToClient(userUpdate);
		});
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("cancel_friend")
	async cancelFriend(@MessageBody() body : {id_user_send : number, id_user_receive : number}) {
		//Get user receive and delete current notification friend and delete a current req friend
		await this.userService.getOne(body.id_user_receive)
		.then(async (user : User & {
			notification : any;
			RoomToUser : any;
		}) => {
			const idNotif = this.userService.getIdNotifFriend(user.notification, body.id_user_send);
			const arr = this.userService.filterId(user.req_received_friend, body.id_user_send);
			if (idNotif != undefined) {
				await this.userService.updateUser({
					notification : {
						delete : {
							id : idNotif
						}
					},
					req_received_friend: {
						set: arr
					}
				}, user.id)
				.then((userUpdate : User) => {
					this.emitToClient(userUpdate);
				})
			}
		})

		//Get user send and delete current req friend
		await this.userService.getOne(body.id_user_send)
		.then(async (user : User) => {
			const arr = this.userService.filterId(user.req_send_friend, body.id_user_receive);
			await this.userService.updateUser({
				req_send_friend : {
					set : arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})
		
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("accept_friend")
	async acceptFriend(@MessageBody() body : {user : User, notif : Notification}) {
		//Update user receive req friend, delete notif and push in friend_id is_user_receive
		await this.userService.getOne(body.user.id)
		.then(async (user : User) => {
			const arr = this.userService.filterId(user.req_received_friend, body.notif.id_user_send);
			await this.userService.updateUser({
				notification : {
					delete : {
						id : body.notif.id
					}
				},
				friend_id : {
					push : body.notif.id_user_send
				},
				req_received_friend: {
					set: arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})

		//Update user send a req friend, push into friend_id a id_user_receive and delete req_send_friend for this id_user_receive
		await this.userService.getOne(body.notif.id_user_send)
		.then(async (user : User) => {
			const arr = this.userService.filterId(user.req_send_friend, body.user.id);
			await this.userService.updateUser({
				friend_id : {
					push: body.notif.id_user_receive
				},
				req_send_friend : {
					set : arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})			
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("refuse_friend")
	async refuseFriend(@MessageBody() body : {user : User, notif : Notification}) {	

		//Update user receive a friend request and delete current notif friend
		await this.userService.getOne(body.user.id)
		.then(async (user : User) => {
			const arr = this.userService.filterId(user.req_received_friend, body.notif.id_user_send);
			await this.userService.updateUser({
				notification : {
					delete : {
						id : body.notif.id
					}
				},
				req_received_friend: {
					set: arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})

		//Get user send a friend request and remove this in array req_send_friend
		await this.userService.getOne(body.notif.id_user_send)
		.then((user : User) => {
			const arr = this.userService.filterId(user.req_send_friend, body.user.id);
			this.userService.updateUser({
				req_send_friend : {
					set : arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("delete_friend")
	async deleteFriend(@MessageBody() body : {id_user_send : number, id_user_receive : number}) {
		await this.userService.getOne(body.id_user_send)
		.then(async (user : User) => {
			const arr = this.userService.filterId(user.friend_id, body.id_user_receive);
			await this.userService.updateUser({
				friend_id : {
					set : arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})

		await this.userService.getOne(body.id_user_receive)
		.then((user : User) => {
			const arr = this.userService.filterId(user.friend_id, body.id_user_send);
			this.userService.updateUser({
				friend_id : {
					set : arr
				}
			}, user.id)
			.then((userUpdate : User) => {
				this.emitToClient(userUpdate);
			})
		})
	}

	emitToClient(user : User) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == user.id) {
				elem.client.emit("event_friend", user)
			}
		})
	}
}