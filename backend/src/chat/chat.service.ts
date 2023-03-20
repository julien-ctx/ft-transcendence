import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { Room, User } from '@prisma/client';
import { truncateSync } from 'fs';

@Injectable()
export class ChatService {
	constructor(
		private prisma : PrismaService,
		private UserService : UserService,
	) {}

	async getUsersRooms(User : any, room : string) {
		const Room = await this.getRoomByName(room);
		const relation = await this.prisma.roomToUser.findMany({
			where : {
				id_room : Room.id,
				user : {
					id : {
						not : User.id
					}
				}
			},
			include : {
				user : true,
			}
		})
		return relation.map((elem) => {
			return elem.user
		})
	}

	forSameUserService(id : number, event : string, params : any, Client : any) {
		const Same = Client.filter((elem : any) => {
			if (elem.user.id === id)
				return elem;
		});
		Same.forEach((elem : any) => {
			elem.client.emit(event, params);
		});
	}

	async updateBan(room : any, Client : any) {
		room.banned.forEach(async (elem : any) => {
			let now = new Date();
			if (elem.endBan < now) {
				let who = elem.id_user;
				await this.prisma.banned.delete({
					where : {
						id : elem.id,
					}
				});
				if (room.status === 'Public') {
					this.forSameUserService(who, 'newPublicRoom', room, Client);
				}
			}
		});
	}

	async getPublics(id_user : number) {
		const rooms = await this.prisma.roomToUser.findMany({
			include : {
				room : {
					include : {
						banned : true,
					},
				},
				user : true,
			}
		});
		let notIn = [];
		rooms.forEach((elem) => {
			let banned = false;
			let Public = true;
			if (elem.room.status !== 'Public')
				Public = false;
			elem.room.banned.forEach((ban) => {
				if (ban.id_user === id_user)
					banned = true;
			});
			if (elem.user.id_user !== id_user) {
				let found = false;
				rooms.forEach((other) => {
					if (other.room.id === elem.room.id) {
						if (other.user.id_user === id_user) {
							found = true;
						}
					}
				})
				// console.log(notIn.includes(elem.room));
				for (let i = 0; i < notIn.length; i++) {
					if (notIn[i].id === elem.room.id)
						found = true;
				}
				if (found === false && banned === false && Public === true) {
					notIn.push(elem.room);
				}
			}
		});
		return notIn;	  
	}

	async getTimedMute(room : any, user : any) {
		const relation = await this.prisma.roomToUser.findFirst({
			where : {
				id_room : room.id,
				id_user : user.id_user,
			}
		});
		return relation.EndMute;
	}

	async muteUpdate(room: any, user: any) {
		const relation = await this.prisma.roomToUser.findFirst({
			where : {
				id_room : room.id,
				id_user : user.id_user,
			}
		});
		if (relation === null) return false;
		if (relation.Muted === true) {
			let now : Date = new Date();
			if (now > relation.EndMute) {
				await this.prisma.roomToUser.update({
					where : {
						id : relation.id
					},
					data : {
						Muted : false,
						EndMute : now,
					}
				});
				return true;
			}
			else 
				return false;
		}
		else 
			return true;
	}

	getDateMute(EndMute : Date) {
		let time = {Years: '', Months: '', Days: '', Hours: '', Minutes: '', Seconds: ''};
		time.Years = EndMute.getFullYear().toString();
		time.Months = EndMute.getMonth().toString();
		time.Days = EndMute.getDate().toString();
		time.Hours = EndMute.getHours().toString();
		time.Minutes = EndMute.getMinutes().toString();
		time.Seconds = EndMute.getSeconds().toString();
		time.Years = time.Years.length === 1 ? '0' + time.Years : time.Years;
		time.Months = time.Months.length === 1 ? '0' + time.Months : time.Months;
		time.Days = time.Days.length === 1 ? '0' + time.Days : time.Days;
		time.Hours = time.Hours.length === 1 ? '0' + time.Hours : time.Hours;
		time.Minutes = time.Minutes.length === 1 ? '0' + time.Minutes : time.Minutes;
		time.Seconds = time.Seconds.length === 1 ? '0' + time.Seconds : time.Seconds;
		return time; 
	}

	async getMyRelation(id : number, room : string) {
		const Room = await this.getRoomByName(room);
		const relation = await this.prisma.roomToUser.findFirst({
			where : {
				id_room : Room.id,
				id_user : id,
			}
		});
		return relation;
	}

	async isInRoom(user : any, room : any) {
		const relation = await this.prisma.roomToUser.findFirst({
			where : {
				id_room : room.id,
				id_user : user.id_user,
			}
		});
		return relation !== null;
	}

	async getAllUsersRooms(room : string) {
		const Room = await this.getRoomByName(room);
		const relation = await this.prisma.roomToUser.findMany({
			where : {
				id_room : Room.id
			},
			include : {
				user : true,
			}
		})
		return relation.map((elem) => {
			return elem.user
		})
	}

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
