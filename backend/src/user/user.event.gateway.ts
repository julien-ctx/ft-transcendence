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

	emitToClient(res : any) {
		this.usersArr.forEach(elem => {
			if (elem.user.id == res.id_user) {
				elem.client.emit("event_user", res)
			}
		})
	}
}