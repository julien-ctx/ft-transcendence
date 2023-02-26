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
exports.TmpGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let TmpGateway = class TmpGateway {
    afterInit() {
        console.log('Socket server initialized');
    }
    handleConnection(client) {
        console.log('Client connected:', client.id);
        this.server.emit('message', { text: 'New client connected' });
    }
    handleDisconnect(client) {
        console.log('Client disconnected:', client.id);
        this.server.emit('message', { text: 'Client disconnected' });
    }
    handleMessage(client, body) {
        console.log('Received message:', body);
        this.server.emit('message', { text: 'Message received' });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TmpGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TmpGateway.prototype, "handleMessage", null);
TmpGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: true
    })
], TmpGateway);
exports.TmpGateway = TmpGateway;
//# sourceMappingURL=tmp.gateway.js.map