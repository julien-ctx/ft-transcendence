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
		// console.log(rooms);
		let roomObj = [];
		let Obj : {name : string, owner : boolean, status : string, admin : boolean};
		relation.forEach((relat) => {
			Obj = {name : relat.room.name, owner :relat.owner, status : relat.room.status, admin : relat.admin};
			// roomObj.push(relat.room.name, relat.owner);
			roomObj.push(Obj);
		});
		// console.log(roomObj);
		return roomObj;
	}

	async getAll(id : number) {
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user : {
					not : id
				}
			},
			include: {
				room: true,
			}
		});

		const room = await this.prisma.room.findMany();

		let Rooms : any = [];// {name : string, status : string, members : number} = [];
		let All = await this.prisma.roomToUser.findMany({
			include: {
				room: true,
				user: true,
			}

		});
		let isIn;
		for (let i = 0; i < room.length; i++) {
			isIn = false;
			for (let j = 0; j < All.length; j++) {
				if (All[j].room === room[i] && All[j].user.id_user === id)
					isIn = true;
			}
			if (isIn === false) {
				let members = await this.prisma.roomToUser.findMany({
					where: {
						id_room: room[i].id,
					}
				});
				Rooms.push({
					name : room[i].name,
					status : room[i].status,
					members : members.length,
				});
			}
		}
		// console.log(Rooms);
		return Rooms;
	}

	async getRoomByName(name : string) {
		const room = await this.prisma.room.findUnique({
			where: {
				name: name,
			},
			include: {
				Message : true,
				banned : true,
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
		const message = await this.prisma.messageRoom.create({
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

	async getMembers(name : string, id : number) {
		const room = await this.getRoomByName(name);
		const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_room: room.id,
			},
			include: {
				user: true,
			},
		});
		const members = relation.filter((relat) => relat.user.id_user !== id);
		// console.log(members);
		// const membersObj = members.map((member) => {
			// return member.user;
		// });
		// console.log(membersObj);
		return members;
	}
}
