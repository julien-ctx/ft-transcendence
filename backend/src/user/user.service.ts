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
				notif_friend: true,
				RoomToUser: true,
			}
		});
	}

	async getOne(id : number) {
		return await this.prisma.user.findUnique({
			where: {
				id
			},
			include : {
				notif_friend: true,
				RoomToUser: true,
			}
		});
	}

	async getOneById(id : number) {
		return await this.prisma.user.findUnique({
			where: {
				id_user: id
			},
			include : {
				notif_friend: true,
				RoomToUser: true,
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
				notif_friend: true,
				RoomToUser: true,
			}
		});
	}

	async addNotifFriend(userSend : any, userReceive : any) {
		try {
			const currentUser = await this.getOne(userReceive.id);
			await this.prisma.notifFriend.create({
				data : {
					user : {
						connect : {
							id_user: currentUser.id_user
						}
					},
					id_user_send : userSend.id,
					login_send : userSend.login
				}
			});
			return this.getOne(currentUser.id);
		} catch (error) {
			console.log(error);
		}
	}
}