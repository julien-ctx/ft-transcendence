import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { elementAt } from "rxjs";
import { Server } from "socket.io";
import { UsersSocketInterface } from "./interface/userSocket.interface";
import { UserService } from "./user.service";

@WebSocketGateway({
	path : "/notifFriend",
	cors: true
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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

	@SubscribeMessage("notification_friend")
	handleMessage(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
	}

	@SubscribeMessage("add_friend")
	addFriend(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;

		//Update user receive, create notif friend and connect this with array notif_friend
		this.userService.addNotifFriend(body.user_send, body.user_receive)
		.then((res) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == res.id_user) {
					elem.client.emit("notification_friend", res)
				}
			})
		});

		//Update user send, push in req_friend id_user_receive
		this.userService.updateUser({
			req_friend: {
				push: body.user_receive.id
			}
		}, body.user_send.id)
		.then((res) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == res.id_user) {
					elem.client.emit("notification_friend", res)
				}
			})
		});
	}

	@SubscribeMessage("accept_friend")
	acceptFriend(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const userCheck = this.jwt.decode(token);
		if (userCheck == undefined) return;
		
		//Update user receive req friend, delete notif and push in friend_id is_user_receive
		this.userService.updateUser({
			notif_friend : {
				delete : {
					id : body.notif.id
				}
			},
			friend_id : {
				push : body.notif.id_user_send
			}
		}, body.user.id)
		.then((res) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == res.id_user) {
					elem.client.emit("notification_friend", res)
				}
			})
		})

		//Update user send a req friend, push into friend_id a id_user_receive and delete req_friend for this id_user_receive
		this.userService.getOne(body.notif.id_user_send)
		.then((res) => {
			this.userService.updateUser({
				friend_id : {
					push: body.notif.id_user_receive
				},
				req_friend : {
					set : res.req_friend.filter((elem) => elem !== body.user.id)
				}
			}, res.id)
			.then((res) => {
				this.usersArr.forEach(elem => {
					if (elem.user.id == res.id_user) {
						elem.client.emit("notification_friend", res)
					}
				})
			})			
		})
	}

	@SubscribeMessage("refuse_friend")
	refuseFriend(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const userCheck = this.jwt.decode(token);
		if (userCheck == undefined) return;
		console.log(body);
		
		//Update user receive a friend request and delete current notif friend
		this.userService.updateUser({
			notif_friend : {
				delete : {
					id : body.notif.id
				}
			}
		}, body.user.id)
		.then((res) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == res.id_user) {
					elem.client.emit("notification_friend", res)
				}
			})
		})

		//Get user send a friend request and remove this in array req_friend
		this.userService.getOne(body.notif.id_user_send)
		.then((res) => {
			this.userService.updateUser({
				req_friend : {
					set : res.req_friend.filter((elem) => elem !== body.user.id) 
				}
			}, body.notif.id_user_send)
			.then((res) => {
				this.usersArr.forEach(elem => {
					if (elem.user.id == res.id_user) {
						elem.client.emit("notification_friend", res)
					}
				})
			})
		})

	}

	@SubscribeMessage("delete_friend")
	deleteFriend(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const userCheck = this.jwt.decode(token);
		if (userCheck == undefined) return;

		
		this.userService.getOne(body.user_send.id)
		.then((res) => {
			this.userService.updateUser({
				friend_id : {
					set : res.req_friend.filter((elem) => elem !== body.user_receive.id) 
				}
			}, res.id)
			.then((res) => {
				this.usersArr.forEach(elem => {
					if (elem.user.id == res.id_user) {
						elem.client.emit("notification_friend", res)
					}
				})
			})
		})

		this.userService.getOne(body.user_receive.id)
		.then((res) => {
			this.userService.updateUser({
				friend_id : {
					set : res.req_friend.filter((elem) => elem !== body.user_send.id) 
				}
			}, res.id)
			.then((res) => {
				this.usersArr.forEach(elem => {
					if (elem.user.id == res.id_user) {
						elem.client.emit("notification_friend", res)
					}
				})
			})
		})
	}
}