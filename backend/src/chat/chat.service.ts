import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { Room, User } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(
		private prisma : PrismaService,
		private UserService : UserService,
	) {}

	async alreadyExist(name : string) {
		const room = await this.prisma.room.findUnique({
			where: {
				name: name,
			}
		});
		return room !== null;
	}

	async hashedPass(password : string) {
		const hash = await argon2.hash(password);
		return hash;
	}

	async verifyPass(password : string, hash : string) {
		const verify = await argon2.verify(hash, password);
		return verify;
	}

	async getRooms(id : number) {
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user: id,
			},
			include: {
				room: true,	
			}
		});
		const rooms = relation.map((roomToUser) => 
			roomToUser.room.name
			);
		console.log(rooms);
		let roomObj = [];
		let Obj : {name : string, owner : boolean, status : string};
		relation.forEach((relat) => {
			Obj = {name : relat.room.name, owner :relat.owner, status : relat.room.status};
			// roomObj.push(relat.room.name, relat.owner);
			roomObj.push(Obj);
		});
		console.log(roomObj);
		return roomObj;
	}

	async getRoomByName(name : string) {
		const room = await this.prisma.room.findUnique({
			where: {
				name: name,
			},
			include: {
				Message : true,
			}
		});
		return room;
	}

	async getRelation(User : User, room : Room) {
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user: User.id,
				id_room: room.id,
			}
		});
		return relation;
	}

	async createMessage(id_user : number, id_room : number, content : string) {
		const message = await this.prisma.message.create({
			data: {
				content: content,
				room: {
					connect: {
						id: id_room,
					}
				},
				user: {
					connect: {
						id: id_user,
					}
				}
			}
		});
		return message;
	}
}
