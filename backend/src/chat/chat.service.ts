import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class ChatService {
	constructor(
		private prisma : PrismaService,
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

	async valide(room : string, password) {
		const roomData = await this.prisma.room.findUnique({
			where: {
				name: room,
			}
		});
		return await this.verifyPass(password, roomData.password);
	}
}
