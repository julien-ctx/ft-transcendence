import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    authUser(dto: AuthDto): Promise<void>;
    signup(auth: AuthDto): Promise<void>;
    signin(dto: AuthDto): Promise<void>;
    signToken(auth: AuthDto): Promise<void>;
}
