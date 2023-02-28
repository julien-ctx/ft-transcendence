import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt-two-factor"){
	constructor(config : ConfigService, private prisma : PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get("JWT_SECRET")
		})
	}
	async validate(payload : any) {
		const user = await this.prisma.user.findUnique({
			where: {
				id_user: payload.id
			}
		})
		if (!user)
			throw new UnauthorizedException()
		
		if (!user.twoFaEnabled)
			return user;
		if (!payload.twoFaAuth)
			return user;
	}
}