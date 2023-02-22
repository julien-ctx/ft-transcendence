import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class ChatGateway implements OnGatewayDisconnect {
    server: Server;
    handleChat(client: any, payload: any): void;
    handleDisconnect(client: any): void;
}
