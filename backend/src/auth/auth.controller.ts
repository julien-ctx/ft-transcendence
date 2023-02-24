import { Body, Controller, Post, Request, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Controller("auth")
export class AuthController{
	constructor(private authService: AuthService, private prisma : PrismaService) {}

	@Post("signin")
	async signin(@Body() dto: AuthDto) {
		return await this.authService.authUser(dto)
		.then((res) => {
			console.log(res);
		})
	}
}