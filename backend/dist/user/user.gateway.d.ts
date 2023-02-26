import { JwtService } from "@nestjs/jwt";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server } from "socket.io";
import { UserService } from "./user.service";
export declare class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private userService;
    private jwt;
    private usersArr;
    constructor(userService: UserService, jwt: JwtService);
    server: Server;
    afterInit(): void;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    handleMessage(client: any, body: any): void;
    addFriend(client: any, body: any): void;
    acceptFriend(client: any, body: any): void;
    refuseFriend(client: any, body: any): void;
    deleteFriend(client: any, body: any): void;
}
