import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
export declare class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
    private jwt;
    private config;
    private Auth;
    constructor(jwt: JwtService, config: ConfigService, Auth: AuthService);
    server: Server;
    private client;
    handleConnection(client: any, ...args: any[]): Promise<void>;
    handleCreateRoom(client: any, data: any): Promise<void>;
    handleDisconnect(client: any): void;
}
