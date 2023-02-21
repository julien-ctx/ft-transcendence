import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { JwtStrategy } from "src/auth/strategy/jwt.strategy";

@Controller("users")
export class UserController{

	@UseGuards(AuthGuard("jwt"))
	@Get("me")
	getMe(@Req() req : any) {
		return req.user;
	}
}