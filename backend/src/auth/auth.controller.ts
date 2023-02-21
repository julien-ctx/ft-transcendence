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
	signin(@Body() dto: AuthDto) {
		try {
			const user = this.prisma.user.findUnique( { where : {id_user : dto.id} });
			if (user) {
				return this.authService.signin(dto);
			} else {
				return this.authService.signup(dto);
			}
		} catch (err) {
			throw err;
		}
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("me")
	me(@Request() req) {
		return req.user;
	}
}