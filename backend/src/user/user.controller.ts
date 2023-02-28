import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { diskStorage } from "multer";
import { extname } from "path";
import { ConfigService } from "@nestjs/config";
import { UserDto } from "./dto/user.dto";
import { User } from "./user.decorator";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController{
	constructor(private userService : UserService) {}

	@Get("me")
	getMe(@User() userReq : UserDto) {
		return this.userService.getOne(userReq.id);
	}

	@Get("getAll")
	getAll(@User() user : UserDto) {
		return this.userService.getAll(user.id);
	}

	@Get("getAllHimSelf")
	getAllHimSelf(@User() user : UserDto) {
		return this.userService.getAllHimSelf();
	}

	@Get(":id")
	getOne(@Param("id") id : string) {
		let idNumber : number = +id;
		return this.userService.getOne(idNumber);
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
	updateImg(@UploadedFile() file: Express.Multer.File, @User() user : UserDto) {		
		return this.userService.updateUser({ img_link: file.path }, user.id);
	}

	@Post("updateLogin")
	updateLogin(@Body("login") login : any, @User() user : UserDto) {
		return this.userService.updateUser({ login }, user.id);
	}

	@Post("updateConnected")
	updateConnected(@Body("connected") connected : any, @User() user : UserDto) {
		return this.userService.updateUser({ connected }, user.id);
	}

	@Post("fakeUser")
	createFakeUser(@Body() users : any) {
		return this.userService.createManyUser(users);
	}
}