import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService{

	//Create a User
	async signup(dto: any) {
		return "i am signup"
	}

	//Get a User
	async signin(dto: any) {
		return "i am signin"
	}
}