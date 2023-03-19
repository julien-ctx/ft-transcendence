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
				notification: true,
				RoomToUser: true,
				roomMp : true,
				gameHistory :{
					select : {
						user : true,
						score_user1 : true,
						id_user1 : true,
						login_user1 : true,
						img_link_user1 : true,
						score_user2 : true,
						id_user2 : true,
						login_user2 : true,
						img_link_user2: true,
						id_user_winner : true
					}
				}
			}
		})
		if (!user)
			throw new UnauthorizedException()
		return user;
	}
}