import { User } from "@prisma/client";
import { Socket } from "socket.io";

export class Client {
	constructor(
		public socket: Socket,
		public user: User,
		public canvas: GameCanvas,
		public leftPaddle: Paddle,
		public rightPaddle: Paddle | null,
		public ball: Ball,
		public side: number,
	) {}
};

export class Game {
	constructor(
		public leftClient: Client,
		public rightClient: Client | null,
		public playerNumber: number,
		public maxScore: number,
		public botLevel: number,
		public leftPlayerID: number | null,
		public rightPlayerID: number | null,
	) {}
};

export class Paddle {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public score: number,
		public direction: number,
		public speed: number,
	) {}
};

export class Ball {
	constructor(
		public x: number,
		public y: number,
		public size: number,
		public direction: any,
		public speed: any,
	) {}
};

export class GameCanvas {
	constructor (
		public width: number,
		public height: number,
	) {}
};
