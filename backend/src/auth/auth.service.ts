import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService{
	constructor(private prisma : PrismaService, private jwt : JwtService, private config : ConfigService) {}

	async signup(auth: AuthDto) {
		try {
			const user = await this.prisma.user.create({
				data : {
					id_user : auth.id,
					email : auth.email,
					login : auth.login,
					first_name : auth.first_name,
					last_name : auth.last_name,
					img_link : auth.img_link
				}
			});

			return await this.signToken(auth);
		} catch (error) {
			console.log(error);
		}
	}

	async signin(dto: AuthDto) {
		return await this.signToken(dto);
	}

	async signToken(auth : AuthDto) {
		const token = await this.jwt.signAsync(auth, {
			expiresIn: "99 years",
			secret: this.config.get("JWT_SECRET")
		});
		return { access_token : token };
	}

	async validateUser(id_user : number) {
		try {
			const user = await this.prisma.user.findUnique({
				where : {
					id_user
				}
			})
			return user;
		} catch (error) {
			return null;
		}
	}
}