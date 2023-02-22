import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Injectable()
export class AuthService{
	constructor(private prisma : PrismaService, private jwt : JwtService, private config : ConfigService, private jwtStrategy : JwtStrategy) {}

	async signup(auth: AuthDto) {
		await this.prisma.user.create({
			data : {
				id_user : auth.id,
				email : auth.email,
				login : auth.login,
				first_name : auth.first_name,
				last_name : auth.last_name,
				img_link : auth.img_link
			}
		})
		.then((user) => {
			return this.signToken(user);
		})
		.catch((err) => {
			if (err.code == "P2002") {
				throw new ForbiddenException("Credentials taken",);
			}
			throw err;
		})
	}

	//Get a User
	async signin(dto: AuthDto) {
		return this.signToken(dto);
	}

	async signToken(auth : AuthDto) {
		const token = await this.jwt.signAsync(auth, {
			expiresIn: "99 years",
			secret: this.config.get("JWT_SECRET")
		});
		return { access_token : token };
	}

	async me(token) {
		const user = this.jwt.decode(token);
		console.log(user);
	}
}