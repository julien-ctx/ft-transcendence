import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrivateMessageService {
	constructor(private prisma : PrismaService){}

	async getRoomPrivate(id : number) {
		try {
			return await this.prisma.roomMessagePrivate.findUnique({
				where : {
					id
				},
				include : {
					mp : true,
					user : true
				}
			})
		} catch (error) {
			throw error;
		}
	}

	async getRommPrivateWithIdUser(id1 : number, id2 : number) {
		try {
			return await this.prisma.roomMessagePrivate.findFirst({
				where : {
					id_user1 : id1,
					id_user2 : id2
				}
			})
		} catch (error) {
			throw error;
		}
	}

	async getAllWithIdUser(idUser : number) {
		try {
			return await this.prisma.roomMessagePrivate.findMany({
				where : {
					user : {
						some : {
							id : idUser
						}
					}
				},
				include : {
					mp : true,
					user : true
				}
			})
		} catch (error) {
			throw error;
		}
	}

	async getAllMp(id_room : number) {
		return await this.prisma.messagePrivate.findMany({
			where: {
				id_room
			},
			orderBy : {
				createdAt : "asc"
			}
		})
	}

	async updateRoomPrivate(params : {} ,id : number) {
		return await this.prisma.roomMessagePrivate.update({
			where: {
				id
			},
			data : {
				...params,
			},
			include : {
				mp : true,
				user : true
			},
		});
	}

	async createRoomMessagePrivate(user_send : User, user_receive : User) {
		try {
			return await this.prisma.roomMessagePrivate.create({
				data : {
					user : {
						connect : [
							{id : user_send.id},
							{id : user_receive.id}
						],
					},
					open_id : {
						set : user_send.id
					},
					id_user1 : user_send.id,
					id_user2 : user_receive.id
				}
			})			
		} catch (error) {
			throw error;
		}
	}

	async createMessagePrivate(id_user_send : number, id_room : number, content : string) {
		try {
			return await this.prisma.messagePrivate.create({
				data : {
					content,
					id_user_send,
					room : {
						connect : {
							id : id_room
						}
					}
				}
			})
		} catch (error) {
			throw error;
		}
	}
}
