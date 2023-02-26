import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
export declare class AuthController {
    private authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
<<<<<<< HEAD
    signin(dto: AuthDto): Promise<void> | Promise<{
=======
    signin(dto: AuthDto): Promise<void | {
>>>>>>> ae1f97b3d5cdf36350fb7db702ee71b809791a93
        access_token: string;
    }>;
    me(req: any): any;
}
