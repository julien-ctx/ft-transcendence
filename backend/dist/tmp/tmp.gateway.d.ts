import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class TmpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(): void;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    handleMessage(client: any, body: any): void;
}
