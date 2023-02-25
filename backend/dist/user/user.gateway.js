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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGateway = void 0;
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_service_1 = require("./user.service");
let UserGateway = class UserGateway {
    constructor(userService, jwt) {
        this.userService = userService;
        this.jwt = jwt;
        this.usersArr = [];
    }
    afterInit() {
        console.log("Socket server initialized");
    }
    handleConnection(client) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user == undefined)
            return;
        this.usersArr.push({ user, client });
    }
    handleDisconnect(client) {
        this.usersArr.forEach(elem => {
            if (elem.client.id == client.id)
                this.usersArr.pop(elem);
        });
    }
    handleMessage(client, body) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user == undefined)
            return;
    }
    addFriend(client, body) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user == undefined)
            return;
        this.userService.addNotifFriend(body.user_send, body.user_receive)
            .then((user) => {
            this.usersArr.forEach(elem => {
                if (elem.user.id == user.id_user) {
                    elem.client.emit("notification_friend", user);
                }
            });
        });
    }
    acceptFriend(client, body) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user == undefined)
            return;
        this.userService.acceptNotifFriend(user, body.notif)
            .then((user) => {
            this.usersArr.forEach(elem => {
                if (elem.user.id == user.id_user) {
                    elem.client.emit("notification_friend", user);
                }
            });
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], UserGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("notification_friend"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("add_friend"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "addFriend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("accept_friend"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserGateway.prototype, "acceptFriend", null);
UserGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: "/notifFriend",
        cors: true
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, jwt_1.JwtService])
], UserGateway);
exports.UserGateway = UserGateway;
//# sourceMappingURL=user.gateway.js.map