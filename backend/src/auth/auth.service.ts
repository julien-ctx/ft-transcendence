import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService{
	constructor(private prisma : PrismaService, private jwt : JwtService, private config : ConfigService) {}

	async authUser(dto: AuthDto) {
		await this.prisma.user.findUnique( { where : {id_user : dto.id} })
		.then((res) => {
			if (res == null) {
				return this.signup(dto);
			} else {
				this.signin(res)
				.then((token) => {
					console.log("tok ", token);
				})
			}
		});
	}

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

	async signin(dto: AuthDto) {
		return this.signToken(dto);
	}

	async signToken(auth : AuthDto) {
		await this.jwt.signAsync(auth, {
			expiresIn: "99 years",
			secret: this.config.get("JWT_SECRET")
		})
		.then((res) => {
			return {access_token : res};
		})
	}
}