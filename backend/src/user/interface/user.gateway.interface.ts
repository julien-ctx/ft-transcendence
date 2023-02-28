import { Socket } from "socket.io";
import { User } from "@prisma/client";

export interface UserGatewayInterface {
	user : User;
	client : Socket;
}