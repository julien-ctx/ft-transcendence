import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server } from "socket.io";
import { UserGuardGateway } from "./guard/user.guard.gateway";
import { UserService } from "./user.service";


@WebSocketGateway({
	path : "/notif_friend",
	cors: true
})
export class UserFriendGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private usersArr : any = [];
	
	constructor(private userService : UserService, private jwt : JwtService) {}
	@WebSocketServer() server: Server;


	afterInit() {
		console.log("Socket server initialized");
	}

	handleConnection(@ConnectedSocket() client: any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		this.usersArr.push({user, client});
	}

	handleDisconnect(@ConnectedSocket() client: any) {
		this.usersArr.forEach(elem => {
			if (elem.client.id == client.id)
				this.usersArr.pop(elem);			
		});	
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("add_friend")
	async addFriend(@MessageBody() body : any) {	
		//Update user receive, create notif friend and connect this with array notifications
		await this.userService.addNotifFriend(body.user_send, body.user_receive)
		.then((res) => {
			this.emitToClient(res);
		});

		//Update user send, push in req_send_friend id_user_receive
		await this.userService.updateUser({
			req_send_friend: {
				push: body.user_receive.id
			}
		}, body.user_send.id)
		.then((res) => {
			this.emitToClient(res);
		});
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("cancel_friend")
	async cancelFriend(@MessageBody() body : any) {
		//Get user receive and delete current notification friend and delete a current req friend
		await this.userService.getOne(body.id_user_receive)
		.then(async (res) => {
			const idNotif = this.getIdNotifFriend(res.notification, body.id_user_send);
			const arr = this.filterId(res.req_received_friend, body.id_user_send);
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
				}, res.id)
				.then((res) => {
					this.emitToClient(res);
				})
			}
		})

		//Get user send and delete current req friend
		await this.userService.getOne(body.id_user_send)
		.then(async (res) => {
			const arr = this.filterId(res.req_send_friend, body.id_user_receive);
			await this.userService.updateUser({
				req_send_friend : {
					set : arr
				}
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})
		})
		
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("accept_friend")
	async acceptFriend(@MessageBody() body : any) {
		//Update user receive req friend, delete notif and push in friend_id is_user_receive
		await this.userService.getOne(body.user.id)
		.then(async (res) => {
			const arr = this.filterId(res.req_received_friend as [number], body.notif.id_user_send);
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
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})
		})

		//Update user send a req friend, push into friend_id a id_user_receive and delete req_send_friend for this id_user_receive
		await this.userService.getOne(body.notif.id_user_send)
		.then(async (res) => {
			const arr = this.filterId(res.req_send_friend as [number], body.user.id);
			await this.userService.updateUser({
				friend_id : {
					push: body.notif.id_user_receive
				},
				req_send_friend : {
					set : arr
				}
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})			
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("refuse_friend")
	async refuseFriend(@MessageBody() body : any) {	
		//Update user receive a friend request and delete current notif friend
		await this.userService.getOne(body.user.id)
		.then(async (res) => {
			const arr = this.filterId(res.req_received_friend as [number], body.notif.id_user_send);
			await this.userService.updateUser({
				notification : {
					delete : {
						id : body.notif.id
					}
				},
				req_received_friend: {
					set: arr
				}
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})
		})

		//Get user send a friend request and remove this in array req_send_friend
		await this.userService.getOne(body.notif.id_user_send)
		.then((res) => {
			const arr = this.filterId(res.req_send_friend as [number], body.user.id);
			this.userService.updateUser({
				req_send_friend : {
					set : arr 
				}
			}, body.notif.id_user_send)
			.then((res) => {
				this.emitToClient(res);
			})
		})
	}

	@UseGuards(UserGuardGateway)
	@SubscribeMessage("delete_friend")
	async deleteFriend(@MessageBody() body : any) {
		await this.userService.getOne(body.user_send.id)
		.then(async (res) => {
			const arr = this.filterId(res.friend_id as [number], body.user_receive.id);
			await this.userService.updateUser({
				friend_id : {
					set : arr
				}
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})
		})

		await this.userService.getOne(body.user_receive.id)
		.then((res) => {
			const arr = this.filterId(res.friend_id as [number], body.user_send.id);
			this.userService.updateUser({
				friend_id : {
					set : arr
				}
			}, res.id)
			.then((res) => {
				this.emitToClient(res);
			})
		})
	}

	filterId(arr : number [], id : number) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === id)
				arr.splice(i, 1);
		}
		return arr;
	}

	getIdNotifFriend(arr : any , id : number) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id_user_send === id && arr[i].type == 0)
				return arr[i].id
		}
		return undefined;
	}

	emitToClient(res : any) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == res.id_user) {
				elem.client.emit("event_friend", res)
			}
		})
	}
}