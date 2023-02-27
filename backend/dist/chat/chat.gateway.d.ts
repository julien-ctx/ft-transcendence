import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { RoomClass } from './room.interface';
export declare class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
    private jwt;
    private config;
    private Auth;
    private chatService;
    private prisma;
    private Service;
    constructor(jwt: JwtService, config: ConfigService, Auth: AuthService, chatService: ChatService, prisma: PrismaService, Service: UserService);
    server: Server;
    private Client;
    private Rooms;
    handleConnection(client: any, ...args: any[]): Promise<void>;
    handleCreateRoom(client: any, data: any): Promise<void>;
    handleJoinRoom(client: any, data: any): Promise<void>;
    handleMessage(client: any, data: any): void;
    handleAskMessage(client: any, data: any): Promise<void>;
    handleSendMessage(client: any, data: any): Promise<void>;
    handleDisconnect(client: any): void;
    findRoom(name: string): RoomClass;
}
