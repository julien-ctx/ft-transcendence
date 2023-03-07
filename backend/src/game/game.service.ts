import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';
import { Ball, Paddle, GameCanvas, Client } from './objects/objects';

@Injectable()
export class GameService {
	constructor () {}

	randomBallDirection(): number {
		return Math.round(Math.random()) * 2 - 1;
	}

	createLeftPaddle(canvas: GameCanvas) {
		let paddle = new Paddle(
			canvas.width * 0.015,
			canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			canvas.width * 0.005,
			canvas.height * 0.15,
			0,
			0,
			canvas.height * 0.0015,
		);
		return paddle;
	}

	createRightPaddle(canvas: GameCanvas) {
		let paddle = new Paddle(
			canvas.width - canvas.width * 0.015 - canvas.width * 0.005,
			canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			canvas.width * 0.005,
			canvas.height * 0.15,
			0,
			0,
			canvas.height * 0.0015,
		);
		return paddle;	
	}

	createBall(canvas: GameCanvas) {
		let ball = new Ball(
			canvas.width * 0.5,
			canvas.height * 0.5,
			canvas.width * 0.02,
			{
				x: 2 * this.randomBallDirection(),
				y: 2 * this.randomBallDirection(),
			},
			{
				x: canvas.width * 0.004,
				y: canvas.height * 0.007,
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
		client.rightPaddle.y = client.rightPaddle.y * client.canvas.height / height;
		client.rightPaddle.speed = client.canvas.height * 0.0015;

		client.leftPaddle.x = client.canvas.width * 0.015;
		client.leftPaddle.width = client.canvas.width * 0.005;
		client.leftPaddle.height = client.canvas.height * 0.15;
		client.leftPaddle.y = client.leftPaddle.y * client.canvas.height / height;
		client.leftPaddle.speed = client.canvas.height * 0.015;

		client.ball.size = client.canvas.width * 0.02;
		client.ball.x = client.ball.x * client.canvas.width / width;
		client.ball.y = client.ball.y * client.canvas.height / height;
		client.ball.speed = {
			x: client.canvas.width * 0.0004,
			y: client.canvas.height * 0.0007,
		};
	}

	resetBall(ball: Ball, side: number, canvas: GameCanvas) {
		ball.x = canvas.width * 0.5;
		ball.y = canvas.height * 0.5;
		if ((side < 0 && ball.direction.x > 0) ||
			(side > 0 && ball.direction.x < 0))
			ball.direction.x = -ball.direction.x;
		ball.direction.y = this.randomBallDirection() < 0 ? ball.direction.y : -ball.direction.y;
	}

	updateBot(ball: Ball, paddle: Paddle, canvas: GameCanvas) {
		if (ball.y < paddle.y + paddle.height / 2) {
			if (paddle.y - (paddle.speed / 1.3) < 0)
				paddle.y = 0;
			else
				paddle.y -= (paddle.speed / 1.3);
		}
		else if (ball.y > paddle.y + paddle.height / 2) {
			if (paddle.y + paddle.height + (paddle.speed / 1.3) > canvas.height)
				paddle.y = canvas.height - paddle.height;
			else
				paddle.y += (paddle.speed / 1.3);
		}
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

	checkBallPosition(ball: Ball,
		leftPaddle: Paddle,
		rightPaddle: Paddle,
		maxScore: number,
		canvas: GameCanvas) {
		if (ball.x < 0) {
			this.resetBall(ball, -1, canvas);
			if (++rightPaddle.score === maxScore) {
				return 'rightWin';
			}
		}
		else if (ball.x > canvas.width - ball.size) {
			this.resetBall(ball, 1, canvas);
			if (++leftPaddle.score === maxScore) {
				return 'leftWin';
			}
		}
		return 'NoWinner';
	}

	collision(ball: Ball, paddle: Paddle) {
		const deltaX = ball.x - Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
		const deltaY = ball.y - Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
		return (deltaX * deltaX + deltaY * deltaY) < (ball.size * ball.size);
	}

	updateBall(ball: Ball, canvas: GameCanvas, leftPaddle: Paddle, rightPaddle: Paddle) {
		ball.x += ball.direction.x / 2;
		ball.y += ball.direction.y / 2;
		if (ball.y < 0) {
			ball.y = 0;
			ball.direction.y = -ball.direction.y;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			ball.direction.y = -ball.direction.y;
		}
		
		if (ball.x <= leftPaddle.x + leftPaddle.width && this.collision(ball, leftPaddle)) {
			ball.direction.x = -ball.direction.x;
			ball.x = leftPaddle.x + leftPaddle.width;
		}
		else if (ball.x + ball.size >= rightPaddle.x && this.collision(ball, rightPaddle)) {
			ball.direction.x = -ball.direction.x;
			ball.x = rightPaddle.x - ball.size;
		}
	}
}
