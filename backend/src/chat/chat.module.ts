import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';

@Module({
	imports: [JwtModule.register({}), AuthModule],
	providers: [ChatGateway, ChatService, AuthService, JwtStrategy],
})
export class ChatModule {}
