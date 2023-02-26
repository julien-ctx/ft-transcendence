import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    signup(auth: AuthDto): Promise<void>;
    signin(dto: AuthDto): Promise<{
        access_token: string;
    }>;
    signToken(auth: AuthDto): Promise<{
        access_token: string;
    }>;
}
