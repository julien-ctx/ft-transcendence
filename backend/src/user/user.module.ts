import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/auth/auth.controller";
import { UserController } from "./user.controller";
import { UserGateway } from "./user.gateway";
import { UserService } from "./user.service";

@Module({
	imports: [JwtModule.register({})],
	controllers: [UserController],
	providers: [UserService, UserGateway],
})
export class UserModule {}