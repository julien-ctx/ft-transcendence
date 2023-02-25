import { Injectable } from "@nestjs/common";
import { NotifFriend, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
	constructor(private prisma : PrismaService) {}

	async updateMe(params : any , id : number) {
		return this.prisma.user.update({
			where: {
				id
			},
			data : {
				...params
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

	async acceptNotifFriend(user : any, notif : any) {
		try {
			let currentUser = await this.prisma.user.findUnique({
				where: {
					id_user: user.id
				},
				include : {
					notif_friend: true
				}
			});
			
			return await this.prisma.user.update({
				where : {
					id: currentUser.id
				},
				data: {
					notif_friend : {
						delete : {
							id : notif.id
						}
					},
					friend_id : {
						set : [...currentUser.friend_id, notif.id_user_send]
					}
				},
				include : {
					notif_friend: true
				}
			})
		} catch (error) {
			console.log(error);
		}

	}
}