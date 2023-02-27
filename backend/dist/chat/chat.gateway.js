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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth/auth.service");
const errors_handle_1 = require("./errors.handle");
const chat_service_1 = require("./chat.service");
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const room_interface_1 = require("./room.interface");
let ChatGateway = class ChatGateway {
    constructor(jwt, config, Auth, chatService, prisma, Service) {
        this.jwt = jwt;
        this.config = config;
        this.Auth = Auth;
        this.chatService = chatService;
        this.prisma = prisma;
        this.Service = Service;
        this.Client = [];
        this.Rooms = [];
    }
    async handleConnection(client, ...args) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user === undefined)
            return;
        this.Client.push({ user, client });
    }
    async handleCreateRoom(client, data) {
        const token = client.handshake.query.token;
        const user = await this.jwt.decode(token);
        if (user === undefined)
            return;
        let err = new errors_handle_1.errors(data.roomStatus, data.roomName, data.roomDesc, data.roomPass, data.roomPassConfirm);
        err.handle();
        let already = await this.chatService.alreadyExist(data.roomName);
        if (already === true) {
            err.errs.name = 'Room already exist';
        }
        if (err.hasErrors()) {
            console.log('error : ', err.errs.status, err.errs.name, err.errs.desc, err.errs.pass, err.errs.cpass);
            client.emit('errors', err.errs);
            return;
        }
        let mdp = '';
        if (data.roomStatus === 'Protected')
            mdp = await this.chatService.hashedPass(data.roomPass);
        const room = await this.prisma.room.create({
            data: {
                name: data.roomName,
                description: data.roomDesc,
                status: data.roomStatus,
                password: mdp,
            }
        });
        console.log({ user });
        const idUser = user['id'];
        const User = await this.prisma.user.findUnique({
            where: {
                id_user: idUser,
            }
        });
        const relation = await this.prisma.roomToUser.create({
            data: {
                room: {
                    connect: {
                        id: room.id,
                    }
                },
                user: {
                    connect: {
                        id: User.id,
                    }
                },
            }
        });
        client.emit('successCreate');
        client.emit('rooms', room.name);
    }
    async handleJoinRoom(client, data) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user === undefined)
            return;
        else if (data.roomName === '') {
            client.emit('errors', { name: 'Room name is required' });
            return;
        }
        const room = await this.prisma.room.findUnique({
            where: {
                name: data.roomName,
            }
        });
        const idUser = user['id'];
        const User = await this.prisma.user.findUnique({
            where: {
                id_user: idUser,
            }
        });
        if (room === null) {
            client.emit('errors', { already: 'Room does not exist' });
            return;
        }
        let alreadyJoin = await this.prisma.roomToUser.findMany({
            where: {
                id_user: User.id_user,
                id_room: room.id,
            }
        });
        if (room === null) {
            client.emit('errors', { already: 'Room does not exist' });
            return;
        }
        else if (alreadyJoin.length > 0) {
            client.emit('errors', { already: 'You already join this room' });
            return;
        }
        if (room.status === 'Protected' && data.roomPass === '') {
            client.emit('needPass');
            return;
        }
        else if (room.status === 'Protected' && data.roomPass !== '') {
            let valide = await this.chatService.verifyPass(data.roomPass, room.password);
            if (valide === false) {
                client.emit('errors', { pass: 'Wrong password' });
                return;
            }
        }
        await this.prisma.roomToUser.create({
            data: {
                room: {
                    connect: {
                        id: room.id,
                    }
                },
                user: {
                    connect: {
                        id: User.id,
                    }
                },
            }
        });
        client.emit('successJoin');
        client.emit('rooms', room.name);
        return;
    }
    handleMessage(client, data) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user === undefined)
            return;
        const idUser = user['id'];
        const User = this.prisma.user.findUnique({
            where: {
                id_user: idUser,
            }
        });
    }
    async handleAskMessage(client, data) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user === undefined)
            return;
        const idUser = user['id'];
        const User = await this.Service.getOneById(idUser);
        const Room = await this.chatService.getRoomByName(data.roomName);
        console.log(this.findRoom(Room.name));
        let roomInstance = this.findRoom(Room.name);
        if (roomInstance === undefined) {
            roomInstance = new room_interface_1.RoomClass(User, client, Room.name);
            this.Rooms = [...this.Rooms, roomInstance];
        }
        else {
            roomInstance.addUser(User, client);
        }
        console.log(this.Rooms);
        Room.Message.forEach((message) => {
            client.emit('getMessages', message.content);
        });
    }
    async handleSendMessage(client, data) {
        const token = client.handshake.query.token;
        const user = this.jwt.decode(token);
        if (user === undefined)
            return;
        const idUser = user['id'];
        const User = await this.Service.getOneById(idUser);
        const Room = await this.chatService.getRoomByName(data.roomName);
        const message = await this.chatService.createMessage(User.id, Room.id, data.message);
        const roomInstance = this.findRoom(Room.name);
        roomInstance.ClientUser.forEach((elem) => {
            elem.Client.emit('getMessages', message.content);
        });
    }
    handleDisconnect(client) {
    }
    findRoom(name) {
        console.log('The room', this.Rooms);
        return this.Rooms.find((room) => room.roomName === name);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleCreateRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('Message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('askMessages'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAskMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: '/chat',
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        auth_service_1.AuthService,
        chat_service_1.ChatService,
        prisma_service_1.PrismaService,
        user_service_1.UserService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map