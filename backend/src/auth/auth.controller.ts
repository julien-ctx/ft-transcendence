import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController{
	authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}

	//Create a User
	@Post("signup")
	signup(@Body() dto: any) {
		return this.authService.signup(dto);
	}
	//Get a User
	@Post("signin")
	signin(@Body() dto: any) {
		return this.authService.signin(dto);
	}
}