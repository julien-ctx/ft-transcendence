import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { authenticator } from "otplib";
import { toDataURL } from 'qrcode';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class TwoFaService {
	constructor(private prisma : PrismaService) {}

	generateSecret() : string {
		return authenticator.generateSecret();
	}

	generateQrCode(user : User) {
		return toDataURL(authenticator.keyuri(user.first_name, "Transcendence", user.twoFaSecret));
	}

	verifyTwoFaCode(code : string, user : any) {
		return authenticator.verify({
			token : code,
			secret: user.twoFaSecret
		})
	}
}