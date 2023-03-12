import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios, { AxiosRequestConfig } from "axios";
import { firstValueFrom, lastValueFrom, map } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService{
	constructor(private prisma : PrismaService, private jwt : JwtService, private config : ConfigService, private readonly http : HttpService) {}

	async signup(auth: AuthDto, secret : string) {
		try {
			await this.prisma.user.create({
				data : {
					id_user : auth.id,
					email : auth.email,
					login : auth.login,
					first_name : auth.first_name,
					last_name : auth.last_name,
					img_link : auth.img_link,
					twoFaSecret : secret
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

	async getAccessToken(code : string) {
		const url = 'https://api.intra.42.fr/oauth/token';
		const config = {
			headers: { 'Content-Type': 'application/json' },
		};
		const body = {
			grant_type: 'authorization_code',
			client_id: 'u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6',
			client_secret: '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',
			code,
			redirect_uri: 'http://localhost:4000/auth/connexion/',
		};

		try {
			return await axios.post(url, body, config);
		} catch (error) {
			throw error;
		}
	}

	async getUser42(access_token : string) {
		return await axios.get("https://api.intra.42.fr/v2/me", { 
			headers :  {
				Authorization: `Bearer ${access_token}`
			}
		})
	}
}