import { Injectable } from "@nestjs/common";
import { NotifFriend, User, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
	constructor(private prisma : PrismaService) {}

	async updateUser(params : any , id : number) {
		return await this.prisma.user.update({
			where: {
				id
			},
			data : {
				...params,
			},
			include : {
				notif_friend: true
			}
		});
	}

	async getOne(id : number) {
		return await this.prisma.user.findUnique({
			where: {
				id
			},
			include : {
				notif_friend: true
			}
		});
	}

	async getAll(id : number) {
		return await this.prisma.user.findMany({
			where: {
				id : {
					not: id
				}
			},
			include : {
				notif_friend: true
			}
		});
	}

	async addNotifFriend(userSend : any, userReceive : any) {
		try {
			await this.prisma.notifFriend.create({
				data : {
					user : {
						connect : {
							id_user: userReceive.id_user
						}
					},
					id_user_send : userSend.id,
					login_send : userSend.login,
					img_link: userSend.img_link
				}
			});
			return await this.updateUser({
				req_received_friend : {
					push: userSend.id
				}
			}, userReceive.id);
		} catch (error) {
			console.log(error);
		}
	}
}