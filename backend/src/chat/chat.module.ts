import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChatController } from './chat.controller';

@Module({
	imports: [JwtModule.register({}), AuthModule],
	providers: [ChatGateway, ChatService, AuthService, JwtStrategy, UserService],
	controllers: [ChatController],
})
export class ChatModule {}
