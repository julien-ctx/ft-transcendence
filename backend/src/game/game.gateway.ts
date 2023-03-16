import { GameService } from './game.service';
import { Game, Client } from './objects/objects';
import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";

const MAX_SCORE = 10;

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
	
	private games: Game[] = [];

	@WebSocketServer() server: Server;

	afterInit() {}

	handleConnection(socket : Socket) {}

	handleDisconnect(socket: Socket) {
		const disconnectData = this.removeFromGame(socket);
		if (disconnectData) {
			clearInterval(disconnectData.gameInterval);
			disconnectData.client.socket.emit('winner', {
				winner: disconnectData.client.user.login,
				side: disconnectData.side,
				forfeit: true
			});	
		}
	}

	removeFromGame(socket: Socket) {
		let client: Client | null = null;
		let side = 0;
		this.games.forEach((game, index) => {
			if ((game.leftClient.socket === socket)) {
				client = game.rightClient;
				side = 1;
				this.games.splice(index, 1);
				return {game: game, side: side};
			} else if (game.rightClient && game.rightClient.socket === socket) {
				client = game.leftClient;
				side = -1;
				this.games.splice(index, 1);
				return {gameInterval: game.interval, client: client, side: side};
			}
		});
		return null;
	}

	async storeGameInDB(game: Game, client: Client, winner: boolean) {
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
				id_user_winner : client.user.id
			},
			include : {
				user : true
			}
		});

		let totalGamesWin = client.user.totalGamesWin;
		let level = client.user.level;
		if (winner) {
			totalGamesWin++;
			level += 0.42;
		}
		await this.prismaService.user.update({
			where : {
				id : client.user.id
			},
			data : {
				totalGames : client.user.totalGames + 1,
				totalGamesWin : totalGamesWin,
				level : level,
			},
			include : {
				gameHistory : true,
				notification : true,
				roomMp : true,
				RoomToUser : true
			}
		})
		.then(async (userUpdate : User) => {
			const winrate = client.user.totalGames ? parseInt((client.user.totalGamesWin * 100 / client.user.totalGames).toString()) : 0;
			await this.prismaService.user.update({
				where : {
					id : client.user.id
				},
				data : {
					winrate : winrate,	
				},
				include : {
					gameHistory : true,
					notification : true,
					roomMp : true,
					RoomToUser : true
				}
			})	
			this.server.emit("user_update", userUpdate);
		})
		.catch((error) => {
			console.log(error);
		})
	}
	
	async gameLoop(game: Game) {
		const winner = await this.gameService.checkBallPosition(game, this.gameService.randomBallDirection());
		if (winner !== 'NoWinner') {
			if (winner === 'Bot') {
				game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
			} else if (winner === game.leftClient.user.login) {
				game.leftClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
				if (game.rightClient) {
					game.rightClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
				}
				await this.storeGameInDB(game, game.rightClient, false);
				await this.storeGameInDB(game, game.leftClient, true);
			} else if (winner === game.rightClient.user.login){
				game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
				if (game.rightClient) {
					game.rightClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
				}
				await this.storeGameInDB(game, game.rightClient, true);
				await this.storeGameInDB(game, game.leftClient, false);
			}
			return;
		}

		this.gameService.updateBall(game.leftClient);
		this.gameService.movePaddles(game.leftClient.leftPaddle, game.leftClient.canvas);

		game.leftClient.socket.emit('paddlesData', {leftPaddle: game.leftClient.leftPaddle, rightPaddle: game.leftClient.rightPaddle});
		game.leftClient.socket.emit('ballData', {ball: game.leftClient.ball});
		if (game.playerNumber === 2) {
			this.gameService.updateBall(game.rightClient);
			this.gameService.movePaddles(game.rightClient.leftPaddle, game.rightClient.canvas);
			this.gameService.syncObjects(game.leftClient, game.rightClient);

			game.rightClient.socket.emit('paddlesData', {leftPaddle: game.rightClient.leftPaddle, rightPaddle: game.rightClient.rightPaddle});
			game.rightClient.socket.emit('ballData', {ball: game.rightClient.ball});
		}
		if (game.playerNumber == 1)
			this.gameService.updateBot(game.leftClient.ball, game.leftClient.rightPaddle, game.leftClient.canvas, game.botLevel);
	}

	setClientEvents(socket: Socket, client: Client) {
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
	}

	async getDBUser(socket: Socket, data: any) {
		const token = socket.handshake.query.token as string;
		const intraUser = this.jwt.decode(token);
		if (intraUser == undefined) {
			console.log('intraUser undefined');
			return null;
		}
		const DBUser = await this.prismaService.user.findUnique({
			where : {
				id_user : intraUser['id'],
			}
		});
		return DBUser;
	}

	async getClient(socket: Socket, data: any, DBUser: User) {
		let canvas = this.gameService.createCanvas(data.width, data.height);
		return new Client(
			socket,
			DBUser,
			canvas,
			this.gameService.createLeftPaddle(canvas),
			this.gameService.createRightPaddle(canvas),
			this.gameService.createBall(canvas),
			0,
		);
	}

	addClientInGame(game: Game | null, client: Client, data: any) {
		if (game) {
			client.side = 1;
			game.rightClient = client;
			return true;
		} else {
			client.side = -1;
			this.games.push(new Game(client, null, 2, MAX_SCORE, data.botLevel, data.leftPlayerID, data.rightPlayerID, null));	
			return false;
		}
	}

	@SubscribeMessage('ready')
	async startGame(socket: Socket, data: {width, height, playerNumber, botLevel, leftPlayerID, rightPlayerID}) {
		const DBUser = await this.getDBUser(socket, data);
		if (!DBUser) return console.log('Undefined DBUser');
		const client = await this.getClient(socket, data, DBUser);
		if (!client) return console.log('Undefined client');

		let gameReady = false;
		let game: Game | null = null;

		if (data.playerNumber === 1) {
			client.side = -1;
			this.games.push(new Game(client, null, 1, MAX_SCORE, data.botLevel, data.leftPlayerID, data.rightPlayerID, null));
			gameReady = true;
		} else {
			if (data.leftPlayerID < 0 && data.rightPlayerID < 0) {
				game = this.games.find(
					game => game.playerNumber === 2
					&& game.rightClient === null
					&& client.user.login != game.leftClient.user.login
					&& game.leftPlayerID < 0
					&& game.rightPlayerID < 0
				);
				gameReady = this.addClientInGame(game, client, data);
			} else {
				game = this.games.find(
					game => game.playerNumber === 2
					&& game.rightClient === null
					&& client.user.login != game.leftClient.user.login
					&& DBUser.id === game.rightPlayerID
					&& data.leftPlayerID === game.leftPlayerID
				);
				gameReady = this.addClientInGame(game, client, data);
			}
		}
		this.setClientEvents(socket, client);
		
		if (gameReady) {
			if (data.playerNumber == 2) {
				game.leftClient.socket.emit('foundOpponent', {
					opponentLogin: game.rightClient.user.login,
					playerLogin: game.leftClient.user.login,
					leftPaddle: game.leftClient.leftPaddle,
					rightPaddle: game.leftClient.rightPaddle,
					ball: game.leftClient.ball,
					playerSide: -1,
				});
				game.rightClient.socket.emit('foundOpponent', {
					opponentLogin: game.leftClient.user.login,
					playerLogin: game.rightClient.user.login,
					leftPaddle: game.rightClient.leftPaddle,
					rightPaddle: game.rightClient.rightPaddle,
					ball: game.rightClient.ball,
					playerSide: 1,
				});
			} else if (data.playerNumber === 1) {
				socket.emit('foundOpponent', {
					opponentLogin: 'Bot',
					playerLogin: client.user.login,
					leftPaddle: client.leftPaddle,
					rightPaddle: client.rightPaddle,
					ball: client.ball,
					playerSide: -1,
				});
			}	
		}
	}
	
	@SubscribeMessage('gameLoop')
	launchGameLoop(socket: Socket) {
		try {
			const game = this.games[this.games.length - 1];
			let randomBallDirectionX = this.gameService.randomBallDirection();
			let randomBallDirectionY = this.gameService.randomBallDirection();
			game.leftClient.ball.direction.x *= randomBallDirectionX;
			game.leftClient.ball.direction.y *= randomBallDirectionY;
			if (game.playerNumber === 2) {
				game.rightClient.ball.direction.x *= randomBallDirectionX;
				game.rightClient.ball.direction.y *= randomBallDirectionY;
			}
			game.interval = setInterval(this.gameLoop, 1, game);
		} catch (error) {
			console.log(error);
		}
	}
};
