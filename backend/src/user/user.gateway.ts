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

		this.userService.addNotifFriend(body.user_send, body.user_receive)
		.then((user) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == user.id_user) {
					elem.client.emit("notification_friend", user)
				}
			})
		});
	}

	@SubscribeMessage("accept_friend")
	acceptFriend(@ConnectedSocket() client: any, @MessageBody() body : any) {
		const token = client.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		this.userService.acceptNotifFriend(user, body.notif)
		.then((user) => {
			this.usersArr.forEach(elem => {
				if (elem.user.id == user.id_user) {
					elem.client.emit("notification_friend", user)
				}
			})
		})
	}
}