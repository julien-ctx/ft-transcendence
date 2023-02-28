import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { authenticator } from "otplib";
import { toDataURL } from 'qrcode';
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TwoFaService {
	constructor(private prisma : PrismaService) {}

	async generateTwoFactorAuthSecret(user : User) {
		const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(user.first_name, "Transcendence", secret);
		await this.prisma.user.update({
			where : {
				id: user.id
			},
			data : {
				twoFaSecret : secret
			}
		})
		return {secret, otpAuthUrl};
	}

	async turn2Fa(user : User) {
		return await this.prisma.user.update({
			where : {
				id: user.id
			},
			data : {
				twoFaEnabled : (user.twoFaEnabled)? false : true
			}
		})
	}

	async verifyTwoFaCode(code : string, user : User) {
		return authenticator.verify({
			token : code,
			secret: user.twoFaSecret
		})
	}

	async qrCodeUrl(otpAuthUrl : string) {
		return toDataURL(otpAuthUrl);
	}
}