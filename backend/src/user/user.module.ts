import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserFriendGateway } from "./user.friend.gateway";
import { UserService } from "./user.service";

@Module({
	imports: [JwtModule.register({})],
	controllers: [UserController],
	providers: [UserService, UserFriendGateway],
})
export class UserModule {}