import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';
import { Ball, Paddle, GameCanvas } from './objects/objects';

@Injectable()
export class GameService {
	constructor () {}

	randomBallDirection(): number {
		return Math.round(Math.random()) * 2 - 1;
	}

	handleResize(
		oldCanvas: GameCanvas,
		canvas: GameCanvas,
		leftPaddle: Paddle,
		rightPaddle: Paddle,
		ball: Ball,
	) {
		const width = oldCanvas.width;
		const height = oldCanvas.height;
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		rightPaddle.x = canvas.width - canvas.width * 0.015 - canvas.width * 0.005;
		rightPaddle.width =  canvas.width * 0.005;
		rightPaddle.height = canvas.height * 0.15;
		rightPaddle.y = rightPaddle.y * canvas.height / height;
		leftPaddle.x = canvas.width * 0.015;
		leftPaddle.width = canvas.width * 0.005;
		leftPaddle.height = canvas.height * 0.15;
		leftPaddle.y = leftPaddle.y * canvas.height / height;
		ball.size = canvas.width * 0.02;
		ball.x = ball.x * canvas.width / width;
		ball.y = ball.y * canvas.height / height;
		rightPaddle.speed = canvas.height * 0.015;
		leftPaddle.speed = canvas.height * 0.015;
		ball.speed = {
			x: canvas.width * 0.004,
			y: canvas.height * 0.007,
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
			if (paddle.y - (paddle.speed / 2) < 0)
				paddle.y = 0;
			else
				paddle.y -= (paddle.speed / 1.25);
		}
		else if (ball.y > paddle.y + paddle.height / 2) {
			if (paddle.y + paddle.height + (paddle.speed / 2) > canvas.height)
				paddle.y = canvas.height - paddle.height;
			else
				paddle.y += (paddle.speed / 1.25);
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
		ball.x += ball.direction.x * ball.speed.x;
		ball.y += ball.direction.y * ball.speed.y;
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
	
	setLeftPaddle(paddle: Paddle, canvas: GameCanvas) {
		paddle.x = 
		paddle.y = 
		paddle.width = 
		paddle.height = canvas.height * 0.15;
		paddle.score = 0;
		paddle.direction = 0; 
		paddle.speed = canvas.height * 0.015;
		return paddle;
	}

	setRightPaddle(paddle: Paddle, canvas: GameCanvas) {
		paddle = {
			x: canvas.width - canvas.width * 0.015 - canvas.width * 0.005,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
			direction: 0,
			speed: canvas.height * 0.015,
		};
	}

	setBall(ball: Ball, canvas: GameCanvas) {
		ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.02,
			direction: {
				x: 2 * this.randomBallDirection(),
				y: 2 * this.randomBallDirection(),
			},
			speed: {
				x: canvas.width * 0.004,
				y: canvas.height * 0.007,
			},
		};
	}
}
