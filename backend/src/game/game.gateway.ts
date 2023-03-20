import { GameService } from './game.service';
import { Game, Client } from './objects/objects';
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
	
	private games: Game[] = [];

	@WebSocketServer() server: Server;

	afterInit() {}

	handleConnection(socket : Socket) {}

	async handleDisconnect(socket: Socket) {
		const data = this.removeFromGame(socket);
		if (data) {
			await this.updateUserState(data.game.leftClient.user.id, 1)
			.then((user) => {
				this.server.emit('user_update', user);	
			});
			if (data.game.rightClient) {
				data.client.socket.emit('winner', {
					winner: data.client.user.login,
					side: data.winnerSide,
					forfeit: true,
				});
				await this.updateUserState(data.game.rightClient.user.id, 1)
				.then((user) => {
					this.server.emit('user_update', user);	
				});
			}
			this.games.splice(data.index, 1);
		}
	}

	removeFromGame(socket: Socket) {
		let client: Client | null = null;
		let winnerSide = 0;
		for (let i = 0; i < this.games.length; i++) {
			if (this.games[i].leftClient.socket === socket) {
				client = this.games[i].rightClient;
				winnerSide = 1;
				return {game: this.games[i], client: client, winnerSide: winnerSide, index: i};
			} else if (this.games[i].rightClient && this.games[i].rightClient.socket === socket) {
				client = this.games[i].leftClient;
				winnerSide = -1;
				return {game: this.games[i], client: client, winnerSide: winnerSide, index: i};
			}
		}
		return null;
	}

	async updateUser(user: User, userScore: number, otherScore: number, winner: boolean) {
		const totalGamesWin = winner ? user.totalGamesWin + 1 : user.totalGamesWin;
		const totalGames = user.totalGames + 1;
		const level = winner ? user.level + 0.20 : user.level + 0.1;

		let fanny: boolean = user.fanny;
		let double_fanny: boolean = user.double_fanny;
		let first_win: boolean = user.first_win;
		if (userScore === 0 && !user.fanny)
			fanny = true;
		if (userScore === 0 && user.fanny)
			double_fanny = true;
		if (userScore > otherScore && !user.first_win)
			first_win = true;

		await this.prismaService.user.update({
			where : {
				id : user.id
			},
			data : {
				totalGames : totalGames,
				totalGamesWin : totalGamesWin,
				level : parseFloat((level).toFixed(2)),
				winrate : parseInt((totalGamesWin * 100 / (totalGames)).toString()),
				fanny : fanny,
				double_fanny : double_fanny,
				first_win : first_win,
			},
			include : {
				gameHistory : {
					select : {
						id : true,
						createdAt : true,
						user : true,
						score_user1 : true,
						id_user1 : true,
						login_user1 : true,
						img_link_user1 : true,
						score_user2 : true,
						id_user2 : true,
						login_user2 : true,
						img_link_user2 : true,
						id_user_winner : true
					}
				},
				notification : true,
				roomMp : true,
				RoomToUser : true
			}
		})
		.then((user) => {
			this.server.emit('user_update', user);
		});
	}

	async storeGameInDB(game: Game, winnerClient: Client, looserClient: Client, winnerScore: number, looserScore: number) {
		await this.prismaService.gameHistory.create({
			data : {
				user : {
					connect : [
						{id : game.leftClient.user.id},
						{id : game.rightClient.user.id},
					]
				},
				score_user1 : game.leftClient.leftPaddle.score,
				id_user1 : game.leftClient.user.id,
				login_user1 : game.leftClient.user.login,
				img_link_user1 : game.leftClient.user.img_link,

				score_user2 : game.rightClient.rightPaddle.score,
				id_user2 : game.rightClient.user.id,
				login_user2 : game.rightClient.user.login,
				img_link_user2 : game.rightClient.user.img_link,
				
				id_user_winner : winnerClient.user.id,
			},
			include : {
				user : true,
			}
		})
		.then(async () => {
			await this.updateUser(winnerClient.user, winnerScore, looserScore, true)
			.then(async () => {
				await this.updateUser(looserClient.user, looserScore, winnerScore, false)
				.catch((error) => {
					console.log(error);
				})
			})
			.catch((error) => {
				console.log(error);
			})
		})
		.catch((error) => {
			console.log(error);
		});

	}
	
	async gameLoop(game: Game) {
		if (game.isProcessing) return;
		const winner = await this.gameService.checkBallPosition(game, this.gameService.randomBallDirection());
		if (winner !== 'NoWinner') {
			game.isProcessing = true;
			clearInterval(game.interval)
			if (winner === 'Bot') {
				game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
			} else if (winner === game.leftClient.user.login) {
				game.leftClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
				if (game.rightClient) {
					game.rightClient.socket.emit('winner', {winner: winner, side: -1, forfeit: false});
					if (game.leftClient.leftPaddle.score !== game.rightClient.rightPaddle.score)
						await this.storeGameInDB(
							game,
							game.leftClient,
							game.rightClient,
							game.leftClient.leftPaddle.score,
							game.rightClient.rightPaddle.score,
						);
				}
			} else if (winner === game.rightClient.user.login) {
				game.leftClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
				if (game.rightClient) {
					game.rightClient.socket.emit('winner', {winner: winner, side: 1, forfeit: false});
					if (game.leftClient.leftPaddle.score !== game.rightClient.rightPaddle.score)
						await this.storeGameInDB(
							game,
							game.rightClient,
							game.leftClient,
							game.rightClient.rightPaddle.score,
							game.leftClient.leftPaddle.score,
						);
				}
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
			this.games.push(new Game(client, null, 2, MAX_SCORE, data.botLevel, data.leftPlayerID, data.rightPlayerID, null, false));	
			return false;
		}
	}

	@SubscribeMessage('ready')
	async startGame(socket: Socket, data: {width, height, playerNumber, botLevel, leftPlayerID, rightPlayerID}) {
		if (!socket.handshake.query.game) return;
		const DBUser = await this.getDBUser(socket, data);
		if (!DBUser) return console.log('Undefined DBUser');
		const client = await this.getClient(socket, data, DBUser);
		if (!client) return console.log('Undefined client');

		let gameReady = false;
		let game: Game | null = null;

		if (data.playerNumber === 1) {
			client.side = -1;
			this.games.push(new Game(client, null, 1, MAX_SCORE, data.botLevel, data.leftPlayerID, data.rightPlayerID, null, false));
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

	async updateUserState(id: number, state: number) {
		return await this.prismaService.user.update({
			where : {
				id : id
			},
			data : {
				activity: state,
			},
			include : {
				gameHistory : {
					select : {
						user : true,
						score_user1 : true,
						id_user1 : true,
						login_user1 : true,
						img_link_user1 : true,
						score_user2 : true,
						id_user2 : true,
						login_user2 : true,
						img_link_user2 : true,
						id_user_winner : true,
					}
				},
				notification : true,
				roomMp : true,
				RoomToUser : true
			}
		});
	}
	
	@SubscribeMessage('gameLoop')
	async launchGameLoop(socket: Socket) {
		await new Promise(r => setTimeout(r, 100));
		try {
			let game = this.games[this.games.length - 1];
			let randomBallDirectionX = this.gameService.randomBallDirection();
			let randomBallDirectionY = this.gameService.randomBallDirection();
			if (!game.leftClient.ball) return;
			game.leftClient.ball.direction.x *= randomBallDirectionX;
			game.leftClient.ball.direction.y *= randomBallDirectionY;
			await this.updateUserState(game.leftClient.user.id, 2)
			.then((user) => {
				this.server.emit('user_update', user);	
			});
			if (game.playerNumber === 2) {
			if (!game.rightClient.ball) return;
				game.rightClient.ball.direction.x *= randomBallDirectionX;
				game.rightClient.ball.direction.y *= randomBallDirectionY;
				await this.updateUserState(game.rightClient.user.id, 2)
				.then((user) => {
					this.server.emit('user_update', user);	
				});
			}
			game.interval = setInterval(this.gameLoop, 1, game);
		} catch (error) {
			console.log(error);
		}
	}
};
