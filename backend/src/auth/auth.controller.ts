import { Body, Controller, Post, Request, UseGuards, Get, UnauthorizedException, Param, Query, Redirect, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { TwoFaService } from "./twoFa.service";
import { UserDec } from "src/user/user.decorator";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { JwtSimpleStrategy } from "./strategy/jwt.simple.strategy";
import { JwtSimpleGuard } from "./guard/jwt-simple.guard";
import { User } from "@prisma/client";

@Controller("auth")
export class AuthController{
	constructor(
		private authService: AuthService, 
		private prisma : PrismaService,
		private twoFaService : TwoFaService,
		private jwtService : JwtService
	) {}

	@Get("connexion/")
	@Redirect("http://localhost:5173/login")
	async connexion(@Query("code") code, @Res({passthrough : true}) response : Response) {
		await this.authService.getAccessToken(code)
		.then(async (res) => {
			await this.authService.getUser42(res.data.access_token)
			.then(async (res : any) => {
				let userIntra = {
					id: res.data.id,
					email: res.data.email,
					login: res.data.login,
					first_name: res.data.first_name,
					last_name: res.data.last_name,
					img_link: res.data.image.link,
				};
				try {
					const user = await this.prisma.user.findUnique({
						where : {
							id_user : userIntra.id
						},
						include : {
							notification: true,
							RoomToUser: true,
							roomMp : true
						}
					});
					if (user) {
						await this.authService.signin(userIntra)
						.then((res : any) => {
							response.cookie("jwt", res.access_token)

						})
					} else {
						await this.authService.signup(userIntra)
						.then((res : any) => {
							response.cookie("jwt", res.access_token)
						})
					}
				} catch (err) {
					throw err;
				}
			})
		})
	}

	@Get("logout")
	async logout(@Res({passthrough : true}) response : Response) {
		response.cookie("jwt", undefined);
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

	@UseGuards(JwtSimpleGuard)
	@Get("me")
	me(@Request() req) {
		return req.user;
	}

	@UseGuards(JwtAuthGuard)
	@Post("2fa/enable")
	async enable2fa(@UserDec() user) {
		try {
			const currentUser = await this.prisma.user.findUnique({
				where : {
					id : user.id
				}
			})
			let secret : string = currentUser.twoFaSecret;		
			if (!secret)
				secret  = this.twoFaService.generateSecret();
			return await this.prisma.user.update({
				where : {
					id : user.id
				},
				data : {
					twoFaEnabled : true,
					twoFaSecret : secret,
					twoFaAuth : true
				}
			})
		} catch (error) {
			throw new error;
		}
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
	async login(@Body("code2fa") code2fa, @Body("user") user : User) {
		let dtoUser :  AuthDto = {
									id : user.id_user,
									email : user.email ,
									login : user.login,
									first_name : user.first_name, 
									last_name : user.last_name,
									img_link : user.img_link
								}
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
		return await this.authService.signin(dtoUser);
	}

}