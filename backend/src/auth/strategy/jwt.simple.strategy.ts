import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtSimpleStrategy extends PassportStrategy(Strategy, "jwt-simple"){
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
			},
			include : {
				roomMp : true,
				RoomToUser : true,
				notification : true,
				banned : true
			}
		})
		if (!user)
			throw new UnauthorizedException()
		return user;
	}
}