import { Injectable } from "@nestjs/common";
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
			where: {
				id : {
					not: id
				}
			},
			include : {
				notification: true,
				RoomToUser: true,
			}
		});
	}

	async getAllHimSelf() {
		return await this.prisma.user.findMany();
	}

	async addNotifFriend(userSend : any, userReceive : any) {
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
}