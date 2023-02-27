import { Body, Controller, Post, Request, UseGuards, Get } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";

@Controller("auth")
export class AuthController{
	constructor(private authService: AuthService, private prisma : PrismaService) {}

	@Post("signin")
	async signin(@Body() dto: AuthDto) {
		try {
			const user = await this.prisma.user.findUnique({
				where : {
					id_user : dto.id
				},
				include : {
					notification: true
				}
			});
			if (user) {
				return await this.authService.signin(dto);
			} else {
				return await this.authService.signup(dto);
			}
		} catch (err) {
			throw err;
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	me(@Request() req) {
		return req.user;
	}
}