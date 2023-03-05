import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { request } from 'http';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';
import { Ball, Paddle, GameCanvas } from './objects/objects';

let interval: any;

@WebSocketGateway({cors: true})
export class GameGateway {
	constructor (
		private gameCanvas: GameCanvas,
		private leftPaddle: Paddle,
		private rightPaddle: Paddle,
		private ball: Ball,
		private game: GameService,
		private prisma: PrismaService,
	) {}

	private maxScore: number = 2;
	@WebSocketServer() server: Server;

	gameLoop(client: any, t: any) {
		const winner = t.game.checkBallPosition(t.ball, t.leftPaddle, t.rightPaddle, t.maxScore, t.gameCanvas);
		if (winner === 'leftWin' || winner === 'rightWin') {
			client.emit(winner, {});
			clearInterval(interval);
		}
		client.emit('paddlesData', {leftPaddle: t.leftPaddle, rightPaddle: t.rightPaddle});
		client.emit('ballData', {ball: t.ball});
		client.emit('scoresData', {leftScore: t.leftPaddle.score, rightScore: t.rightPaddle.score});
		t.game.updateBall(t.ball, t.gameCanvas, t.leftPaddle, t.rightPaddle);
		t.game.movePaddles(t.leftPaddle, t.gameCanvas);
		t.game.updateBot(t.ball, t.rightPaddle, t.gameCanvas);
	}

	@SubscribeMessage('ready')
	startGame(client: any, canvas: {width, height}) {
		this.gameCanvas.width = canvas.width;
		this.gameCanvas.height = canvas.height;
		this.leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
			direction: 0,
			speed: canvas.height * 0.015,
		};
		this.rightPaddle = {
			x: canvas.width - canvas.width * 0.015 - canvas.width * 0.005,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
			direction: 0,
			speed: canvas.height * 0.015,
		};
		this.ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.02,
			direction: {
				x: 2 * this.game.randomBallDirection(),
				y: 2 * this.game.randomBallDirection(),
			},
			speed: {
				x: canvas.width * 0.004,
				y: canvas.height * 0.007,
			},
		};
		this.game.setBall(this.ball, this.gameCanvas);
		client.on('resize',  ({ width, height }) => {
			this.game.handleResize(
				this.gameCanvas,
				new GameCanvas(width, height),
				this.leftPaddle,
				this.rightPaddle,
				this.ball,
			);
		});
		client.on('keydown', ({ move }) => {
			if (move === 'ArrowUp') {
				this.leftPaddle.direction = -1;
			} else if (move === 'ArrowDown') {
				this.leftPaddle.direction = 1;
			}
		});
		client.on('keyup', ({ move }) => {
			if (move === 'ArrowUp' || move === 'ArrowDown') {
				this.leftPaddle.direction = 0;
			}
		});
		client.on('mouvemove', ({ mouseY }) => {
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > this.gameCanvas.height - (this.leftPaddle.height)) {
				mouseY = this.gameCanvas.height - (this.leftPaddle.height);
			}
			this.leftPaddle.y = mouseY;
		});
		client.emit('paddlesData', {leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle});
		client.emit('ballData', {ball: this.ball});
		client.emit('scoresData', {leftScore: this.leftPaddle.score, rightScore: this.rightPaddle.score});
		interval = setInterval(this.gameLoop, 10, client, this);
	}
};
