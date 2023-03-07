import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { request } from 'http';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';
import { Ball, Paddle, GameCanvas } from './objects/objects';
import { findLast } from 'lodash';

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

	private maxScore: number = 11;
	
	@WebSocketServer() server: Server;

	setLeftPaddle() {
		this.leftPaddle = {
			x: this.gameCanvas.width * 0.015,
			y: this.gameCanvas.height * 0.5 - (this.gameCanvas.height * 0.15 / 2),
			width: this.gameCanvas.width * 0.005,
			height: this.gameCanvas.height * 0.15,
			score: 0,
			direction: 0,
			speed: this.gameCanvas.height * 0.0015,
		};
	}

	setRightPaddle() {
		this.rightPaddle = {
			x: this.gameCanvas.width - this.gameCanvas.width * 0.015 - this.gameCanvas.width * 0.005,
			y: this.gameCanvas.height * 0.5 - (this.gameCanvas.height * 0.15 / 2),
			width: this.gameCanvas.width * 0.005,
			height: this.gameCanvas.height * 0.15,
			score: 0,
			direction: 0,
			speed: this.gameCanvas.height * 0.0015,
		};
	}

	setBall() {
		this.ball = {
			x: this.gameCanvas.width * 0.5,
			y: this.gameCanvas.height * 0.5,
			size: this.gameCanvas.width * 0.02,
			direction: {
				x: 2 * this.game.randomBallDirection(),
				y: 2 * this.game.randomBallDirection(),
			},
			speed: {
				x: this.gameCanvas.width * 0.004,
				y: this.gameCanvas.height * 0.007,
			},
		};
	}

	gameLoop(client: any, instance: any) {
		const winner = instance.game.checkBallPosition(
			instance.ball,
			instance.leftPaddle,
			instance.rightPaddle,
			instance.maxScore,
			instance.gameCanvas
		);
		if (winner === 'leftWin' || winner === 'rightWin') {
			client.emit(winner, {});
			clearInterval(interval);
			return;
		}
		client.emit('paddlesData', {leftPaddle: instance.leftPaddle, rightPaddle: instance.rightPaddle});
		client.emit('ballData', {ball: instance.ball});
		client.emit('scoresData', {leftScore: instance.leftPaddle.score, rightScore: instance.rightPaddle.score});
		instance.game.updateBall(instance.ball, instance.gameCanvas, instance.leftPaddle, instance.rightPaddle);
		instance.game.movePaddles(instance.leftPaddle, instance.gameCanvas);
		instance.game.updateBot(instance.ball, instance.rightPaddle, instance.gameCanvas);
	}

	@SubscribeMessage('ready')
	startGame(socket: any, data: {width, height, playerNumber}) {
		this.gameCanvas.width = data.width;
		this.gameCanvas.height = data.height;
		this.setLeftPaddle();
		this.setRightPaddle();
		this.setBall();

		socket.on('resize',  ({ width, height }) => {
			this.game.handleResize(
				this.gameCanvas,
				width,
				height,
				this.leftPaddle,
				this.rightPaddle,
				this.ball,
			);
		});
		socket.on('keydown', ({ move }) => {
			if (move === 'ArrowUp') {
				this.leftPaddle.direction = -1;
			} else if (move === 'ArrowDown') {
				this.leftPaddle.direction = 1;
			}
		});
		socket.on('keyup', ({ move }) => {
			if (move === 'ArrowUp' || move === 'ArrowDown') {
				this.leftPaddle.direction = 0;
			}
		});
		socket.on('mousemove', ({ mouseY }) => {
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > this.gameCanvas.height - (this.leftPaddle.height)) {
				mouseY = this.gameCanvas.height - (this.leftPaddle.height);
			}
			this.leftPaddle.y = mouseY;
		});
		socket.emit('initData', {
			leftPaddle: this.leftPaddle,
			rightPaddle: this.rightPaddle,
			ball: this.ball,
		});

		interval = setInterval(this.gameLoop, 1, socket, this);
	}
};
