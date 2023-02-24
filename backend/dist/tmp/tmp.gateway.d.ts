import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
    constructor();
    server: Server;
    handleConnection(client: any, ...args: any[]): Promise<void>;
    handleCreateRoom(client: any, data: any): Promise<void>;
    handleJoinRoom(client: any, data: any): Promise<void>;
    handleDisconnect(client: any): void;
}
