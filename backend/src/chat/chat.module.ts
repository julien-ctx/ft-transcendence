import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { UserService } from 'src/user/user.service';
import { ChatController } from './chat.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [JwtModule.register({}), AuthModule, HttpModule],
	providers: [ChatGateway, ChatService, AuthService, JwtStrategy, UserService],
	controllers: [ChatController],
})
export class ChatModule {}
