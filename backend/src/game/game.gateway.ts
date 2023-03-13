import { GameService } from './game.service';
import { Ball, Paddle, GameCanvas, Game, Client, WaitingClient } from './objects/objects';
import { findLast } from 'lodash';
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";

const MAX_SCORE = 2;

@WebSocketGateway({
	cors: true,
	path: '/pong'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (
	private gameService : GameService,
	private jwt : JwtService,
	private prismaService : PrismaService
	) {this.gameLoop = this.gameLoop.bind(this);}
	
	private queue: WaitingClient[] = [];
	private games: Game[] = [];
	private interval: any = null;
	private tests: boolean = false;

	@WebSocketServer() server: Server;

	afterInit() {}

	async handleConnection(socket : Socket) {
		const token = socket.handshake.query.token as string;
		const user = this.jwt.decode(token);
		if (user == undefined) return;
		const fullUserData = await this.prismaService.user.findUnique({
			where : {
				id_user : user['id'],
			}
		})
		this.queue.push(new WaitingClient(socket, fullUserData))
	}

	handleDisconnect(socket: Socket) {
		if (!this.removeFromQueue(socket)) {
			const WinnerByForfeit: any = this.removeFromGame(socket);
			if (WinnerByForfeit.client) {
				WinnerByForfeit.client.socket.emit('winner', {winner: WinnerByForfeit.client.user.login, side: WinnerByForfeit.side, forfeit: true});
			}
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
		}
	}

	removeFromQueue(socket: Socket): boolean {
		for (let i = 0; i < this.queue.length; i++) {
			if (this.queue[i].socket == socket) {
				this.queue.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	removeFromGame(socket: Socket) {
		let client: Client | null = null;
		let side = 0;
		this.games.forEach((game, index) => {
			if ((game.leftClient.socket === socket)) {
				client = game.rightClient;
				side = 1;
				this.games.splice(index, 1);
			} else if (game.rightClient && game.rightClient.socket === socket) {
				client = game.leftClient;
				side = -1;
				this.games.splice(index, 1);
			}
		});
		return {client: client, side: side};
	}

	async storeGameInDB(game: Game, winnerClient: Client) {
		await this.prismaService.gameHistory.create({
			data : {
				user : {
					connect : [
						{id : game.leftClient.user.id},
						{id : game.rightClient.user.id},
					]
				},
				score_user1 : game.leftClient.leftPaddle.score,
				score_user2 : game.rightClient.rightPaddle.score,
				id_user_winner : winnerClient.user.id
			},
			include : {
				user : true
			}
		});
		await this.prismaService.user.update({
			where : {
				id : winnerClient.user.id
			},
			data : {
				totalGames : winnerClient.user.totalGames + 1,
				totalGamesWin : winnerClient.user.totalGamesWin + 1,
				level : winnerClient.user.level + 0.42,
				winrate : winnerClient.user.totalGamesWin * 100 / winnerClient.user.totalGames,	
			},
			include : {
				gameHistory : true,
				notification : true,
				roomMp : true,
				RoomToUser : true
			}
		})
		.then((userUpdate : User) => {
			this.server.emit("user_update", userUpdate);
		});
	}
	
	
	async gameLoop(game: Game) {
		const winner = this.gameService.checkBallPosition(game, this.gameService.randomBallDirection());
		if (winner !== 'NoWinner') {
			if (winner === 'Bot') {
				game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
			} else if (winner === game.leftClient.user.login) {
				// game.leftClient.socket.on('gameStoredInDB', ({}) => {
					game.leftClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
					game.rightClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
				// });
				// await this.storeGameInDB(game, game.leftClient);
			} else if (winner === game.rightClient.user.login){
				// game.leftClient.socket.on('gameStoredInDB', ({}) => {
					game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
					game.rightClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
				// });
				// await this.storeGameInDB(game, game.rightClient);
			}
			return;
		}

		this.gameService.updateBall(game.leftClient);
		this.gameService.movePaddles(game.leftClient.leftPaddle, game.leftClient.canvas);

		game.leftClient.socket.emit('paddlesData', {leftPaddle: game.leftClient.leftPaddle, rightPaddle: game.leftClient.rightPaddle});
		game.leftClient.socket.emit('ballData', {ball: game.leftClient.ball});
		game.leftClient.socket.emit('scoresData', {leftScore: game.leftClient.leftPaddle.score, rightScore: game.leftClient.rightPaddle.score});
		if (game.playerNumber === 2) {
			this.gameService.updateBall(game.rightClient);
			this.gameService.movePaddles(game.rightClient.leftPaddle, game.rightClient.canvas);
			this.gameService.syncObjects(game.leftClient, game.rightClient);

			game.rightClient.socket.emit('paddlesData', {leftPaddle: game.rightClient.leftPaddle, rightPaddle: game.rightClient.rightPaddle});
			game.rightClient.socket.emit('ballData', {ball: game.rightClient.ball});
			game.rightClient.socket.emit('scoresData', {leftScore: game.rightClient.leftPaddle.score, rightScore: game.rightClient.rightPaddle.score});
		}
		if (game.playerNumber == 1)
			this.gameService.updateBot(game.leftClient.ball, game.leftClient.rightPaddle, game.leftClient.canvas, game.botLevel);
	}

	@SubscribeMessage('ready')
	startGame(socket: Socket, data: {width, height, playerNumber, botLevel}) {
		let waitingClient = this.queue.find(waitingClient => waitingClient.socket === socket);
		if (!waitingClient) {
			return console.log('waitingClient null');
		}
		if (socket === waitingClient.socket) {
			this.removeFromQueue(socket);
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
		);
		let gameReady = false;
		let game: Game | null = null;
		if (data.playerNumber === 1) {
			client.side = -1;
			this.games.push(new Game(client, null, 1, MAX_SCORE, data.botLevel));
			gameReady = true;
		} else if (this.games.find(game => game.playerNumber === 2 && game.rightClient === null)) {
			game = this.games.find(game => game.playerNumber === 2 && game.rightClient === null
					&& client.user.login != game.leftClient.user.login);
			if (!game) {
				return console.log('game null');
			}
			client.side = 1;
			game.rightClient = client;
			gameReady = true;
		} else {
			client.side = -1;
			this.games.push(new Game(client, null, 2, MAX_SCORE, data.botLevel));
		}
		socket.on('resize', ({width, height}) => {
			this.gameService.handleResize(
				client,
				width,
				height,
			);
		});
		socket.on('mousemove', ({mouseY}) => {
			let paddle = client.side < 0 ? client.leftPaddle : client.rightPaddle;
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > client.canvas.height - (paddle.height)) {
				mouseY = client.canvas.height - (paddle.height);
			}
			paddle.y = mouseY;
		});
		
		if (gameReady) {
			if (data.playerNumber == 2) {
				game.leftClient.socket.emit('foundOpponent', {
					login: game.rightClient.user.login,
					leftPaddle: game.leftClient.leftPaddle,
					rightPaddle: game.leftClient.rightPaddle,
					ball: game.leftClient.ball,
					side: -1,
					maxScore: MAX_SCORE
				});
				game.rightClient.socket.emit('foundOpponent', {
					login: game.leftClient.user.login,
					leftPaddle: game.rightClient.leftPaddle,
					rightPaddle: game.rightClient.rightPaddle,
					ball: game.rightClient.ball,
					side: 1,
					maxScore: MAX_SCORE
				});
			} else if (data.playerNumber === 1) {
				socket.emit('foundOpponent', {
					login: 'the bot',
					leftPaddle: client.leftPaddle,
					rightPaddle: client.rightPaddle,
					ball: client.ball,
					side: -1,
					maxScore: MAX_SCORE
				});
			}	
		}
	}
	
	@SubscribeMessage('gameLoop')
	launchGameLoop(socket: Socket) {
		const game = this.games[this.games.length - 1];
		let randomBallDirectionX = this.gameService.randomBallDirection();
		let randomBallDirectionY = this.gameService.randomBallDirection();
		game.leftClient.ball.direction.x *= randomBallDirectionX;
		game.leftClient.ball.direction.y *= randomBallDirectionY;
		if (game.playerNumber === 2) {
			game.rightClient.ball.direction.x *= randomBallDirectionX;
			game.rightClient.ball.direction.y *= randomBallDirectionY;
		}
		this.interval = setInterval(this.gameLoop, 1, game);
	}
};
