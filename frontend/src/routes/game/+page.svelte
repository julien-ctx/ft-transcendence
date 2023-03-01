<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io, { Socket } from 'socket.io-client';
    import { right } from "@popperjs/core";
	
	let isLogged = false;
	onMount(async () => {
		AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})
	});
	
	let gameStarted: boolean = false;
	let maxScore: number = 2;

	let canvas: HTMLCanvasElement;
	let ctx: any;

	let rightPaddle: any;
	let leftPaddle: any;
	let paddleDirection: number = 0;

	let ball: any;
	let speed = {
		x: Math.round(Math.random()) * 2 - 1 < 0 ? -6 : 6,
		y: Math.round(Math.random()) * 2 - 1 < 0 ? -7 : 7,
	}

	function drawPaddles(color: string) {
		ctx.fillStyle = color;
		ctx.fillRect(
			leftPaddle.x,
			leftPaddle.y,
			leftPaddle.width, leftPaddle.height
		);
		ctx.fillRect(
			rightPaddle.x,
			rightPaddle.y,
			rightPaddle.width, rightPaddle.height
		);
	}

	function drawSep(color: string) {
		for (let i = 0; i < canvas.width; i += ball.size * 2) {
			ctx.fillStyle = color;
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 2, ball.size);
		}
	}

	function collision(paddle: any) {
		return ball.x < paddle.x + paddle.width &&
			ball.x + ball.size > paddle.x &&
			ball.y < paddle.y + paddle.height &&
			ball.y + ball.size > paddle.y;
	}

	function keyboardMoves(canvas: HTMLCanvasElement) {
		document.addEventListener('keydown', function(e) {
			if (e.key == 'ArrowUp') {
				paddleDirection = -1;
			}
			else if (e.key == 'ArrowDown') {
				paddleDirection = 1;
			}
		});

		document.addEventListener('keyup', function(e) {
			if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
				paddleDirection = 0;
			}
		});

		if (paddleDirection == -1) {
			if (leftPaddle.y - 10 >= 0) {
				leftPaddle.y -= 10;
			} else {
				leftPaddle.y = 0;
			}
		}
		else if (paddleDirection == 1) {
			if (leftPaddle.y + 10 <= canvas.height - leftPaddle.height) {
				leftPaddle.y += 10;
			} else {
				leftPaddle.y = canvas.height - leftPaddle.height;
			}
		}
	}

	function mouseMoves(canvas: HTMLCanvasElement) {
		canvas.addEventListener('mousemove', (event) => {
			let mouseY = event.clientY - canvas.offsetTop;
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > canvas.height - (leftPaddle.height)) {
				mouseY = canvas.height - (leftPaddle.height);
			}
			leftPaddle.y = mouseY;
		});

		canvas.addEventListener('mouseleave', (event) => {
			console.log(leftPaddle.y);
			if (leftPaddle.y < canvas.height / 2) {
				leftPaddle.y = 0;
			}
			else if (leftPaddle.y >= canvas.height / 2) {
				leftPaddle.y = canvas.height - leftPaddle.height;
			}
		})
	}

	function displayScore() {
  		ctx.fillText(leftPaddle.score, canvas.width * 0.4, canvas.height * 0.1);
  		ctx.fillText(rightPaddle.score, canvas.width * 0.6 - ctx.measureText(rightPaddle.score).width, canvas.height * 0.1);
	}

	function resetBall(direction: number) {
		ball.x = canvas.width * 0.5;
		ball.y = canvas.height * 0.5;
		if ((direction < 0 && speed.x > 0) ||
			(direction > 0 && speed.x < 0))
			ball.speedX = -speed.x;
		ball.speedY = Math.round(Math.random()) * 2 - 1 < 0 ? speed.y : -speed.y;
	}

	function checkBallPosition() {
		if (ball.x < 0) {
			resetBall(-1);
			if (++rightPaddle.score === maxScore) {
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.fillText(
					'Right Paddle won!',
					canvas.width / 2 - ctx.measureText('Right Paddle won!').width / 2,
					canvas.height / 2
				)
				gameStarted = false;
			}
		}
		else if (ball.x > canvas.width - ball.size) {
			resetBall(1);
			if (++leftPaddle.score === maxScore) {
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.fillText(
					'Left Paddle won!',
					canvas.width / 2 - ctx.measureText('Left Paddle won!').width / 2,
					canvas.height / 2 
				)
				gameStarted = false;
			}
		}
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		displayScore();
	}
		
	function gameLoop() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPaddles('blue');
		ball.x += ball.speedX;
		ball.y += ball.speedY;
		
		if (ball.y < 0) {
			ball.y = 0;
			ball.speedY = -ball.speedY;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			ball.speedY = -ball.speedY;
		}
		
		if (collision(leftPaddle)) {
			ball.speedX = -ball.speedX;
			ball.x = leftPaddle.x + leftPaddle.width;
		}
		else if (collision(rightPaddle)) {
			ball.speedX = -ball.speedX;
			ball.x = rightPaddle.x - ball.size;
		}
		
		checkBallPosition();
		if (gameStarted) {
			drawSep('blue');
			drawBall('red');
			mouseMoves(canvas);
			keyboardMoves(canvas);
			requestAnimationFrame(gameLoop);
		}
	}

	function startGame() {
		gameLoop()
	}

	function drawBall(color: string) {
		ctx.fillStyle = color;
		const radius = ball.size / 2;
		ctx.beginPath();
		ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}

	function initData() {
		rightPaddle = {
			x: canvas.width - canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
		};

		leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
		};

		ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.02,
			speedX: speed.x,
			speedY: speed.y,
		};
	}

	onMount(() => {
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx = canvas.getContext('2d');
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		ctx.fillStyle = 'blue';
		const WelcomeMsg = 'Click to start the game!';
  		ctx.fillText(
			WelcomeMsg,
			canvas.width * 0.5 - ctx.measureText(WelcomeMsg).width / 2,
			canvas.height * 0.5
		);
		canvas.onclick = isReady;
	});

	function isReady() {
		if (!gameStarted) {
			initData();
			gameStarted = true;
			startGame();
		}
	}

</script>

<style>
	canvas:hover {
  		cursor: none;
	}

	canvas {
		background-color: black;
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		display: block;
		outline: lightgrey 0.5vw solid;
		display: flex;
		margin-top: 2%;
	}
</style>
<canvas id="main-game-canvas" class="game-canvas">
</canvas>
