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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateUser(params, id) {
        return await this.prisma.user.update({
            where: {
                id
            },
            data: Object.assign({}, params),
            include: {
                notif_friend: true,
                RoomToUser: true,
            }
        });
    }
    async getOne(id) {
        return await this.prisma.user.findUnique({
            where: {
                id
            },
            include: {
                notif_friend: true,
                RoomToUser: true,
            }
        });
    }
    async getOneById(id) {
        return await this.prisma.user.findUnique({
            where: {
                id_user: id
            },
            include: {
                notif_friend: true,
                RoomToUser: true,
            }
        });
    }
    async getAll(id) {
        return await this.prisma.user.findMany({
            where: {
                id: {
                    not: id
                }
            },
            include: {
                notif_friend: true,
                RoomToUser: true,
            }
        });
    }
    async addNotifFriend(userSend, userReceive) {
        try {
            const currentUser = await this.getOne(userReceive.id);
            await this.prisma.notifFriend.create({
                data: {
                    user: {
                        connect: {
                            id_user: currentUser.id_user
                        }
                    },
                    id_user_send: userSend.id,
                    login_send: userSend.login
                }
            });
            return this.getOne(currentUser.id);
        }
        catch (error) {
            console.log(error);
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map