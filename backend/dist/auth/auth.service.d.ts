import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { JwtStrategy } from "./strategy/jwt.strategy";
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private jwtStrategy;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, jwtStrategy: JwtStrategy);
    signup(auth: AuthDto): Promise<void>;
    signin(dto: AuthDto): Promise<{
        access_token: string;
    }>;
    signToken(auth: AuthDto): Promise<{
        access_token: string;
    }>;
    me(token: any): Promise<void>;
}
