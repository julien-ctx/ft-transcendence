import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { PrivateMessageController } from './private-message.controller';
import { PrivateMessageGateway } from './private-message.gateway';
import { PrivateMessageService } from './private-message.service';

@Module({
  imports: [JwtModule.register({
		secret: new ConfigService().get("JWT_SECRET")
	})],
  controllers: [PrivateMessageController],
  providers: [PrivateMessageService, PrivateMessageGateway, UserService]
})
export class PrivateMessageModule {}
