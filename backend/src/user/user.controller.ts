import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { diskStorage } from "multer";
import { extname } from "path";
import { ConfigService } from "@nestjs/config";
import { access, accessSync, createReadStream } from "fs";

@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UserController{
	constructor(private userService : UserService) {}
	
	@Get("me")
	getMe(@Req() req : any) {
		try {
			accessSync(req.user.img_link);
			return req.user;
		} catch (err) {
			const user = {...req.user, img_link: "/avatar.png"};
			return user;
		}
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
	updateImg(@UploadedFile() file: Express.Multer.File, @Req() req : any) {
		// console.log(file.path);
		return this.userService.updateMe({...req.user, img_link: file.path});
	}

	@Post("updateLogin")
	updateLogin(@Body("login") login : any, @Req() req : any) {
		return this.userService.updateMe({...req.user, login});
	}
}