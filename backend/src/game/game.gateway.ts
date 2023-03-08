import { GameService } from './game.service';
import { Ball, Paddle, GameCanvas, Game, Client, WaitingClient } from './objects/objects';
import { findLast } from 'lodash';
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";

let interval: any;

@WebSocketGateway({
	cors: true,
	path: '/pong'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (
		private gameService : GameService,
		private jwt : JwtService,
		private prisma : PrismaService
	) {
		this.gameLoop = this.gameLoop.bind(this);
	}

	private queue: WaitingClient[] = [];
	private games: Game[] = [];
	private maxScore: number = 11;

	@WebSocketServer() server: Server;

	afterInit() {}

	async handleConnection(socket : Socket) {
		const token = socket.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		const fullUserData = await this.prisma.user.findUnique({
			where : {
				id_user : user['id'],
			}
		})
		this.queue.push(new WaitingClient(socket, fullUserData))
	}

	async handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.removeClient(socket);
	}

	removeClient(socket: Socket) {
		for (let i = 0; i < this.queue.length; i++) {
			if (this.queue[i].socket == socket) {
				this.queue.splice(i, 1);
			}
		}
	}
	
	gameLoop(client: Client) {
		const winner = this.gameService.checkBallPosition(
			client.ball,
			client.leftPaddle,
			client.rightPaddle,
			this.maxScore,
			client.canvas
		);
		if (winner === 'leftWin' || winner === 'rightWin') {
			this.server.emit(winner, {});
			clearInterval(interval);
			return;
		}
		this.server.emit('paddlesData', {leftPaddle: client.leftPaddle, rightPaddle: client.rightPaddle});
		this.server.emit('ballData', {ball: client.ball});
		this.server.emit('scoresData', {leftScore: client.leftPaddle.score, rightScore: client.rightPaddle.score});
		this.gameService.updateBall(client.ball, client.canvas, client.leftPaddle, client.rightPaddle);
		this.gameService.movePaddles(client.leftPaddle, client.canvas);
		this.gameService.updateBot(client.ball, client.rightPaddle, client.canvas);
	}

	@SubscribeMessage('ready')
	startGame(socket: Socket, data: {width, height, playerNumber}) {
		let waitingClient = this.queue.find(waitingClient => waitingClient.socket === socket);
		if (socket === waitingClient.socket) {
			this.removeClient(socket);
		} else {
			console.log("error");
		}
		let canvas = this.gameService.createCanvas(data.width, data.height);
		let client = new Client(
			waitingClient.socket,
			waitingClient.user,
			canvas,
			this.gameService.createLeftPaddle(canvas),
			this.gameService.createRightPaddle(canvas),
			this.gameService.createBall(canvas),
			0,
		)
		if (data.playerNumber === 1) {
			client.side = -1;
			this.games.push(new Game(client, null, 1));
		}//else if () {

		// } else {

		// }

		socket.on('resize',  ({ width, height }) => {
			this.gameService.handleResize(
				client,
				width,
				height,
			);
		});
		socket.on('keydown', ({ move }) => {
			let paddle = client.side < 0 ? client.leftPaddle : client.rightPaddle;
			if (move === 'ArrowUp') {
				paddle.direction = -1;
			} else if (move === 'ArrowDown') {
				paddle.direction = 1;
			}
		});
		socket.on('keyup', ({ move }) => {
			let paddle = client.side < 0 ? client.leftPaddle : client.rightPaddle;
			if (move === 'ArrowUp' || move === 'ArrowDown') {
				paddle.direction = 0;
			}
		});
		socket.on('mousemove', ({ mouseY }) => {
			let paddle = client.side < 0 ? client.leftPaddle : client.rightPaddle;
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > client.canvas.height - (client.canvas.height)) {
				mouseY = client.canvas.height - (client.canvas.height);
			}
			paddle.y = mouseY;
		});
		socket.emit('initData', {
			leftPaddle: client.leftPaddle,
			rightPaddle: client.rightPaddle,
			ball: client.ball,
		});

		interval = setInterval(this.gameLoop, 1, client);
	}
};
