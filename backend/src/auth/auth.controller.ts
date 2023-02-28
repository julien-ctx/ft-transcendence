import { Body, Controller, Post, Request, UseGuards, Get, Req, Res, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { TwoFaService } from "./twoFa.service";
import { toDataURL } from "qrcode"
import { User } from "src/user/user.decorator";

@Controller("auth")
export class AuthController{
	constructor(
		private authService: AuthService, 
		private prisma : PrismaService,
		private twoFaService : TwoFaService
	) {}

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

	@UseGuards(JwtAuthGuard)
	@Post("2fa/setup")
	async setup2fa(@User() user) {
		return await this.prisma.user.update({
			where : {
				id : user.id
			},
			data : {
				twoFaEnabled : true
			}
		})
	}

	@UseGuards(JwtAuthGuard)
	@Get("2fa/getQrCode")
	async getQrCode(@User() user) {
		const { otpAuthUrl } = await this.twoFaService.generateTwoFactorAuthSecret(user)
		return await this.twoFaService.qrCodeUrl(otpAuthUrl);
	}

	@UseGuards(JwtAuthGuard)
	@Post("2fa/login")
	async login(@Body("code2fa") code2fa, @User() user) {

	}

}