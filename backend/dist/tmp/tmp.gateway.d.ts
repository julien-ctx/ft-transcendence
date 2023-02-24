import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: any;
    users: number;
    handleConnection(): Promise<void>;
    handleDisconnect(): Promise<void>;
    onChat(client: any, message: any): Promise<void>;
}
