import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "src/auth/strategy";
import { UserController } from "./user.controller";
import { UserFriendGateway } from "./user.friend.gateway";
import { UserService } from "./user.service";

@Module({
	imports: [JwtModule.register({
		secret: new ConfigService().get("JWT_SECRET")
	})],
	controllers: [UserController],
	providers: [UserService, UserFriendGateway, JwtStrategy],
})
export class UserModule {}