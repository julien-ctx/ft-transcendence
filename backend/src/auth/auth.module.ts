import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { JwtSimpleStrategy } from "./strategy/jwt.simple.strategy";
import { TwoFaService } from "./twoFa.service";

@Module({
	imports: [
		JwtModule.register({
		secret: new ConfigService().get("JWT_SECRET")
		}),
		HttpModule
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, TwoFaService, JwtSimpleStrategy]
})
export class AuthModule {}