import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';
import { GameModule } from './game.module';
import { Ball, Paddle, GameCanvas, Client, Game } from './objects/objects';

@Injectable()
export class GameService {
	constructor () {}

	randomBallDirection(): number {
		return Math.round(Math.random()) * 2 - 1;
	}

	createLeftPaddle(canvas: GameCanvas) {
		let paddle = new Paddle (
			canvas.width * 0.015,
			canvas.height * 0.5 - ((canvas.height * 0.15) / 2),
			canvas.width * 0.005,
			canvas.height * 0.15,
			0,
			0,
			canvas.height * 0.0018,
		);
		return paddle;
	}

	createRightPaddle(canvas: GameCanvas) {
		let paddle = new Paddle(
			canvas.width - canvas.width * 0.015 - canvas.width * 0.005,
			canvas.height * 0.5 - ((canvas.height * 0.15) / 2),
			canvas.width * 0.005,
			canvas.height * 0.15,
			0,
			0,
			canvas.height * 0.0018,
		);
		return paddle;	
	}

	createBall(canvas: GameCanvas) {
		let ball = new Ball(
			canvas.width * 0.5,
			canvas.height * 0.5,
			canvas.width * 0.02,
			{
				x: (canvas.width + canvas.height) * 0.0005,
				y: (canvas.width + canvas.height) * 0.0009,
			},
			{
				x: (canvas.width + canvas.height) * 0.0002,
				y: (canvas.width + canvas.height) * 0.0002,
			},
		);
		return ball;
	}

	createCanvas(width: number, height: number) {
		let canvas = new GameCanvas(
			width,
			height,
		);
		return canvas;
	}

	handleResize(
		client: Client,
		winWidth: number,
		winHeight: number,
	) {
		const width = client.canvas.width;
		const height = client.canvas.height;

		client.canvas.width = winWidth * 0.7;
		client.canvas.height = winHeight * 0.8;

		client.rightPaddle.x = client.canvas.width - client.canvas.width * 0.015 - client.canvas.width * 0.005;
		client.rightPaddle.width =  client.canvas.width * 0.005;
		client.rightPaddle.height = client.canvas.height * 0.15;
		client.rightPaddle.speed = client.canvas.height * 0.0018;

		client.leftPaddle.x = client.canvas.width * 0.015;
		client.leftPaddle.width = client.canvas.width * 0.005;
		client.leftPaddle.height = client.canvas.height * 0.15;
		client.leftPaddle.speed = client.canvas.height * 0.0018;

		client.ball.size = client.canvas.width * 0.02;
		client.ball.x = client.ball.x * client.canvas.width / width;
		client.ball.y = client.ball.y * client.canvas.height / height;
		client.ball.speed = {
			x: (client.canvas.width + client.canvas.height) * 0.0002,
			y: (client.canvas.width + client.canvas.height) * 0.0002,
		};
		client.ball.direction = {
			x: (client.canvas.width + client.canvas.height) * 0.0005,
			y: (client.canvas.width + client.canvas.height) * 0.0009,	
		}
		client.socket.emit('paddlesData', {leftPaddle: client.leftPaddle, rightPaddle: client.rightPaddle})
		client.socket.emit('ballData', {ball: client.ball})
		client.socket.emit('scoresData', {leftScore: client.leftPaddle.score, rightScore: client.rightPaddle.score})
	}

	resetBall(client: Client, side: number, randomBallDirection: number) {
		client.ball.x = client.canvas.width * 0.5;
		client.ball.y = client.canvas.height * 0.5;
		if ((side < 0 && client.ball.direction.x > 0) ||
			(side > 0 && client.ball.direction.x < 0))
			client.ball.direction.x = -client.ball.direction.x;
		client.ball.direction.y = randomBallDirection < 0 ? client.ball.direction.y : -client.ball.direction.y;
	}

	updateBot(ball: Ball, paddle: Paddle, canvas: GameCanvas, botLevel: number) {
		if (ball.y < paddle.y + paddle.height / 2) {
			if (paddle.y - (paddle.speed) < 0) {
				paddle.y = 0;
			}
			else {
				const random = Math.random();
				if (random <= botLevel) {
					paddle.y -= (paddle.speed);
				}
			}
		}
		else if (ball.y > paddle.y + paddle.height / 2) {
			if (paddle.y + paddle.height + (paddle.speed) > canvas.height) {
				paddle.y = canvas.height - paddle.height;
			}
			else {
				const random = Math.random();
				if (random <= botLevel) {
					paddle.y += (paddle.speed);
				}
			}
		}
	}

	syncObjects(leftClient: Client, rightClient: Client) {
		leftClient.rightPaddle.y = rightClient.rightPaddle.y * leftClient.canvas.height / rightClient.canvas.height;
		rightClient.leftPaddle.y = leftClient.leftPaddle.y * rightClient.canvas.height / leftClient.canvas.height;
		rightClient.ball.x = leftClient.ball.x * rightClient.canvas.width / leftClient.canvas.width;
		leftClient.ball.x = rightClient.ball.x * leftClient.canvas.width / rightClient.canvas.width;
		rightClient.ball.y = leftClient.ball.y * rightClient.canvas.height / leftClient.canvas.height;
		leftClient.ball.y = rightClient.ball.y * leftClient.canvas.height / rightClient.canvas.height;
	}

	movePaddles(paddle: Paddle, canvas: GameCanvas) {
		if (paddle.direction == -1) {
			if (paddle.y - paddle.speed >= 0) {
				paddle.y -= paddle.speed;
			} else {
				paddle.y = 0;
			}
		}
		else if (paddle.direction == 1) {
			if (paddle.y + paddle.speed <= canvas.height - paddle.height) {
				paddle.y += paddle.speed;
			} else {
				paddle.y = canvas.height - paddle.height;
			}
		}
	}

	resetPaddles(client: Client) {
		client.leftPaddle.y = client.canvas.height / 2 - client.leftPaddle.height / 2;
		client.rightPaddle.y = client.canvas.height / 2 - client.rightPaddle.height / 2;
	}

	checkBallPosition(game: Game, randomBallDirection: number) {
		if (game.leftClient.ball.x < 0) {
			this.resetPaddles(game.leftClient);
			this.resetBall(game.leftClient, -1, randomBallDirection);
			if (game.playerNumber == 2) {
				this.resetPaddles(game.rightClient);
				this.resetBall(game.rightClient, -1, randomBallDirection);
			}
			game.leftClient.rightPaddle.score++;
			if (game.playerNumber == 2) {
				game.rightClient.rightPaddle.score++;
			}
			if (game.leftClient.rightPaddle.score === game.maxScore) {
				return game.playerNumber === 1 ? 'Bot' : game.rightClient.user['login'];
			}
		}
		else if (game.leftClient.ball.x > game.leftClient.canvas.width - game.leftClient.ball.size) {
			this.resetPaddles(game.leftClient);
			this.resetBall(game.leftClient, 1, randomBallDirection);
			if (game.playerNumber == 2) {
				this.resetPaddles(game.rightClient);
				this.resetBall(game.rightClient, 1, randomBallDirection);
			}
			game.leftClient.leftPaddle.score++;
			if (game.playerNumber == 2) {
				game.rightClient.leftPaddle.score++;
			}
			if (game.leftClient.leftPaddle.score === game.maxScore) {
				return game.leftClient.user['login'];
			}
		}
		return 'NoWinner';
	}

	collision(ball: Ball, paddle: Paddle) {
		const deltaX = ball.x - Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
		const deltaY = ball.y - Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
		return (deltaX * deltaX + deltaY * deltaY) < (ball.size * ball.size);
	}

	async updateBall(client: Client) {
		client.ball.x += (client.ball.direction.x) * client.ball.speed.x;
		client.ball.y += (client.ball.direction.y) * client.ball.speed.y;
		if (client.ball.y < 0) {
			client.ball.y = 0;
			client.ball.direction.y = -client.ball.direction.y;
		}
		else if (client.ball.y > client.canvas.height - client.ball.size) {
			client.ball.y = client.canvas.height - client.ball.size;
			client.ball.direction.y = -client.ball.direction.y;
		}
		
		if (client.ball.x <= client.leftPaddle.x + client.leftPaddle.width && this.collision(client.ball, client.leftPaddle)) {
			client.ball.direction.x = -client.ball.direction.x;
			client.ball.x = client.leftPaddle.x + client.leftPaddle.width;
		}
		else if (client.ball.x + client.ball.size >= client.rightPaddle.x && this.collision(client.ball, client.rightPaddle)) {
			client.ball.direction.x = -client.ball.direction.x;
			client.ball.x = client.rightPaddle.x - client.ball.size;
		}
	}
}
