import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';

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
		const rooms = relation.map((roomToUser) => roomToUser.room.name);
		console.log(rooms);
		return rooms;
	}
}
