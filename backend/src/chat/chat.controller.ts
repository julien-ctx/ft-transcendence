import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { User } from 'src/user/user.decorator';
import { UserDto } from "../user/dto/user.dto";

@UseGuards(AuthGuard("jwt"))
@Controller('Chat')
export class ChatController {

	constructor(
		private Chatservice: ChatService,
	) {}

	@Get('getRooms')
	async getRooms(@User() userReq : UserDto) {
		// console.log(userReq);
		
		return await this.Chatservice.getRooms(userReq.id_user);
	}
}
