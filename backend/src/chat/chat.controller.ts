import { Post, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserDec } from 'src/user/user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('Chat')
export class ChatController {

	constructor(
		private Chatservice: ChatService,
	) {}

	@Get('getRooms')
	async getRooms(@UserDec() userReq : User) {
		return await this.Chatservice.getRooms(userReq.id_user);
	}

	@Get('getAll')
	async getAll(@UserDec() userReq: User) {
		return await this.Chatservice.getAll(userReq.id_user);
	}

	@Get('Users/:room')
	async getUserRoom(@UserDec() userReq: User, @Param('room') room: string) {
		return await this.Chatservice.getUsersRooms(userReq, room);
	}

	@Get('AllUsers/:room')
	async getAllUserRoom(@UserDec() userReq: User, @Param('room') room: string) {
		return await this.Chatservice.getAllUsersRooms(room);
	}

	@Get('getMembers/:room')
	async getMembers(@UserDec() userReq: User, @Param('room') room: string) {
		return await this.Chatservice.getMembers(room, userReq.id_user);
	}

	@Get("getRoom/:room")
	async getRoom(@UserDec() userReq: User, @Param('room') room: string) {
		return await this.Chatservice.getRoomByName(room);
	}

	@Get('getMyRelation/:room')
	async getMyRelation(@UserDec() userReq: User, @Param('room') room: string) {
		const t = await this.Chatservice.getMyRelation(userReq.id_user, room);
		console.log(t);
		return t;
	}
}
