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
		// console.log(userReq);
		
		return await this.Chatservice.getRooms(userReq.id_user);
	}

	@Get('getAll')
	async getAll(@UserDec() userReq: User) {
		return await this.Chatservice.getAll(userReq.id_user);
	}
s
	@Get('getMembers/:room')
	async getRoom(@UserDec() userReq: User, @Param('room') room: string) {
		return await this.Chatservice.getMembers(room, userReq.id_user);
	}
}
