import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

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
				notification: true,
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
				notification: true,
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
				notification: true,
				RoomToUser: true,
			}
		});
	}

	async getOneByIdUser(id_user : number) {
		return await this.prisma.user.findUnique({
			where : {
				id_user
			},
			include : {
				notification : true,
				RoomToUser : true
			}
		})
	}

	async getAll(id : number) {
		return await this.prisma.user.findMany({
			include : {
				notification: true,
				RoomToUser: true,
			}
		});
	}

	async addNotifFriend(userSend : User, userReceive : User) {
		try {
			await this.prisma.notification.create({
				data : {
					user : {
						connect : {
							id_user: userReceive.id_user
						}
					},
					id_user_send : userSend.id,
					login_send : userSend.login,
					img_link: userSend.img_link,
					type : 0
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

	async createManyUser(users : any) {
		return await this.prisma.user.createMany({
			data : users
		});
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

	getIdNotif(arr : any , id : number) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id_user_send === id)
				return arr[i].id
		}
		return undefined;
	}
}