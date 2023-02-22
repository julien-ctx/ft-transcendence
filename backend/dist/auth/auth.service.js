"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async signup(auth) {
        await this.prisma.user.create({
            data: {
                id_user: auth.id,
                email: auth.email,
                login: auth.login,
                first_name: auth.first_name,
                last_name: auth.last_name,
                img_link: auth.img_link
            }
        })
            .then((user) => {
            return this.signToken(user);
        })
            .catch((err) => {
            if (err.code == "P2002") {
                throw new common_1.ForbiddenException("Credentials taken");
            }
            throw err;
        });
    }
    async signin(dto) {
        return this.signToken(dto);
    }
    async signToken(auth) {
        const token = await this.jwt.signAsync(auth, {
            expiresIn: "99 years",
            secret: this.config.get("JWT_SECRET")
        });
        return { access_token: token };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService, config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map