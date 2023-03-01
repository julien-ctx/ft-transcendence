import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { diskStorage } from "multer";
import { extname } from "path";
import { ConfigService } from "@nestjs/config";
import { UserDec } from "./user.decorator";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { User } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController{
	constructor(private userService : UserService) {}

	@Get("me")
	async getMe(@UserDec() userReq : User) {
		return await this.userService.getOne(userReq.id);
	}

	@Get("getAll")
	async getAll(@UserDec() user : User) {
		return await this.userService.getAll(user.id);
	}

	@Get(":id")
	async getOne(@Param("id") id : string) {
		let idNumber : number = +id;
		return await this.userService.getOne(idNumber);
	}

	@Post("updateImg")
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
		  destination: new ConfigService().get("UPLOAD_DIR"),
		  filename: (req, file, cb) => {
			const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
			return cb(null, `${randomName}${extname(file.originalname)}`);
		  },
		}),
	}))
	async updateImg(@UploadedFile() file: Express.Multer.File, @UserDec() user : User) {		
		return await this.userService.updateUser({ img_link: file.path }, user.id);
	}

	@Post("updateLogin")
	async updateLogin(@Body("login") login : any, @UserDec() user : User) {
		return await this.userService.updateUser({ login }, user.id);
	}

	@Post("updateConnected")
	async updateConnected(@Body("connected") connected : any, @UserDec() user : User) {
		if (user.twoFaEnabled && user.twoFaAuth) {
			return await this.userService.updateUser({
				connected,
				twoFaAuth : false
			}, user.id)
		}
		return await this.userService.updateUser({ connected }, user.id);
	}

	@Post("fakeUser")
	async createFakeUser(@Body() users : any) {
		return await this.userService.createManyUser(users);
	}
}