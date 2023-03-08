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
	) {this.gameLoop = this.gameLoop.bind(this);}

	private queue: WaitingClient[] = [];
	private games: Game[] = [];

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
	
	gameLoop(game: Game) {
		const winner = this.gameService.checkBallPosition(game);
		if (winner !== 'NoWinner') {
			if (winner === 'Bot') {
				this.server.emit('winner', {winner: winner, side: 1});
			} else if (winner === game.leftClient.user['name']) {
				this.server.emit('winner', {winner: winner, side: -1});
			} else {
				this.server.emit('winner', {winner: winner, side: 1});
			}
			return clearInterval(interval);
		}
		game.leftClient.socket.emit('paddlesData', {leftPaddle: game.leftClient.leftPaddle, rightPaddle: game.leftClient.rightPaddle});
		game.leftClient.socket.emit('ballData', {ball: game.leftClient.ball});
		game.leftClient.socket.emit('scoresData', {leftScore: game.leftClient.leftPaddle.score, rightScore: game.leftClient.rightPaddle.score});
		this.gameService.updateBall(game.leftClient.ball, game.leftClient.canvas, game.leftClient.leftPaddle, game.leftClient.rightPaddle);
		this.gameService.movePaddles(game.leftClient.leftPaddle, game.leftClient.canvas);
		if (game.playerNumber === 2) {
			game.rightClient.socket.emit('paddlesData', {leftPaddle: game.rightClient.leftPaddle, rightPaddle: game.rightClient.rightPaddle});
			game.rightClient.socket.emit('ballData', {ball: game.rightClient.ball});
			game.rightClient.socket.emit('scoresData', {leftScore: game.rightClient.leftPaddle.score, rightScore: game.rightClient.rightPaddle.score});
			this.gameService.updateBall(game.rightClient.ball, game.rightClient.canvas, game.rightClient.leftPaddle, game.rightClient.rightPaddle);
			this.gameService.movePaddles(game.rightClient.leftPaddle, game.rightClient.canvas);
		}
		if (game.playerNumber == 1)
			this.gameService.updateBot(game.leftClient.ball, game.leftClient.rightPaddle, game.leftClient.canvas);
	}

	@SubscribeMessage('ready')
	startGame(socket: Socket, data: {width, height, playerNumber}) {
		let waitingClient = this.queue.find(waitingClient => waitingClient.socket === socket);
		if (socket === waitingClient.socket) {
			this.removeClient(socket);
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

		let gameReady = false; 
		if (data.playerNumber === 1) {
			client.side = -1;
			this.games.push(new Game(client, null, 1, 2));
			gameReady = true;
		} else if (this.games.find(game => game.playerNumber === 2 && game.rightClient === null)) {
			let game = this.games.find(game => game.playerNumber === 2 && game.rightClient === null);
			client.side = 1;
			game.rightClient = client;
			gameReady = true;
		} else {
			client.side = -1;
			this.games.push(new Game(client, null, 2, 11));
		}

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
			} else if (mouseY > client.canvas.height - (paddle.height)) {
				mouseY = client.canvas.height - (paddle.height);
			}
			paddle.y = mouseY;
		});
		socket.emit('initData', {
			leftPaddle: client.leftPaddle,
			rightPaddle: client.rightPaddle,
			ball: client.ball,
		});
		
		if (gameReady)
			interval = setInterval(this.gameLoop, 1, this.games[this.games.length - 1]);
	}
};
