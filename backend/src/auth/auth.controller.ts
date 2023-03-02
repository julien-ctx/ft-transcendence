import { Body, Controller, Post, Request, UseGuards, Get, Req, Res, UnauthorizedException, Param } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { TwoFaService } from "./twoFa.service";
import { UserDec } from "src/user/user.decorator";

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

	@Get("one/:id")
	async getOne(@Param("id") id ) {
		let idNumber : number = +id;
		return await this.prisma.user.findUnique({
			where : {
				id_user : idNumber
			}
		})
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	me(@Request() req) {
		return req.user;
	}

	@UseGuards(JwtAuthGuard)
	@Post("2fa/enable")
	async enable2fa(@UserDec() user) {
		return await this.prisma.user.update({
			where : {
				id : user.id
			},
			data : {
				twoFaEnabled : true,
				twoFaSecret : this.twoFaService.generateSecret(),
				twoFaAuth : true
			}
		})
	}

	@UseGuards(JwtAuthGuard)
	@Post("2fa/disable")
	async disable2fa(@UserDec() user) {
		return await this.prisma.user.update({
			where : {
				id : user.id
			},
			data : {
				twoFaEnabled : false,
				twoFaAuth: false
			}
		})
	}

	@Post("2fa/getQrCode")
	async getQrCode(@Body("user") user : any) {
		return this.twoFaService.generateQrCode(user);
	}

	@Post("2fa/login")
	async login(@Body("code2fa") code2fa, @Body("dto") dto : AuthDto, @Body("user") user) {		
		const codeIsValid =  this.twoFaService.verifyTwoFaCode(code2fa, user)
		if (!codeIsValid)
			throw new UnauthorizedException();
		await this.prisma.user.update({
			where: {
				id : user.id
			},
			data : {
				twoFaAuth : true
			}
		})
		return await this.authService.signin(dto);
	}

}