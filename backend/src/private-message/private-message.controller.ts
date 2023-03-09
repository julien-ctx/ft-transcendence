import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserDec } from 'src/user/user.decorator';
import { PrivateMessageService } from './private-message.service';

@UseGuards(JwtAuthGuard)
@Controller('mp')
export class PrivateMessageController {
	constructor(private mpService : PrivateMessageService) {}

	@Get("getAllMyRoom")
	async getAllMyRoom(@UserDec() user : User) {
		return await this.mpService.getAllWithIdUser(user.id);
	}
}
